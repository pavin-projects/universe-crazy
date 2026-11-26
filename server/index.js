import { createServer } from "node:http";
import { randomBytes, randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { WebSocketServer } from "ws";
import { skinById, unlockedSkins } from "../shared/skins.js";
import {
  checkLogin,
  createAccount,
  findAccount,
  publicAccount,
  recordResult,
  setSkin,
  validateSignup
} from "./store.js";

const PORT = Number(process.env.PORT) || 8787;
const MAX_BODY_BYTES = 4096;
const MAX_KIND_LENGTH = 40;

const LOBBY_MAX_PLAYERS = 6;
const LOBBY_MIN_PLAYERS = 2;

const sessions = new Map();
const sockets = new Set();
const rooms = new Map();
let lobby = null;

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {});
      } catch {
        reject(new Error("Invalid JSON."));
      }
    });
    req.on("error", reject);
  });
}

function tokenFrom(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

function sessionAccount(req) {
  const token = tokenFrom(req);
  const username = token && sessions.get(token);
  return username ? findAccount(username) : null;
}

function startSession(username) {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, username);
  return token;
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/me") {
    const account = sessionAccount(req);
    if (!account) return sendJson(res, 401, { error: "Not signed in." });
    return sendJson(res, 200, { account: publicAccount(account), skins: unlockedSkins(account.wins) });
  }

  if (req.method === "POST" && url.pathname === "/api/signup") {
    const { username, password } = await readJson(req);
    const problem = validateSignup(username, password);
    if (problem) return sendJson(res, 400, { error: problem });
    const result = createAccount(username, password);
    if (result.error) return sendJson(res, 409, { error: result.error });
    const token = startSession(result.account.username);
    return sendJson(res, 201, { token, account: publicAccount(result.account) });
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    const { username, password } = await readJson(req);
    const account = checkLogin(username, password);
    if (!account) return sendJson(res, 401, { error: "Wrong username or password." });
    const token = startSession(account.username);
    return sendJson(res, 200, { token, account: publicAccount(account) });
  }

  if (req.method === "POST" && url.pathname === "/api/logout") {
    const token = tokenFrom(req);
    if (token) sessions.delete(token);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/skin") {
    const account = sessionAccount(req);
    if (!account) return sendJson(res, 401, { error: "Not signed in." });
    const { skin } = await readJson(req);
    const chosen = skinById(skin);
    if (chosen.id !== skin || account.wins < chosen.wins) {
      return sendJson(res, 403, { error: "That skin is not unlocked yet." });
    }
    setSkin(account.username, chosen.id);
    return sendJson(res, 200, { account: publicAccount(account) });
  }

  return sendJson(res, 404, { error: "Not found." });
}

function send(ws, message) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(message));
}

function broadcast(message) {
  for (const ws of sockets) send(ws, message);
}

function lobbyState(ws) {
  return {
    type: "lobby",
    host: lobby.host.username,
    players: lobby.members.map((ws) => ws.username),
    max: LOBBY_MAX_PLAYERS,
    isHost: lobby.host === ws,
    isJoined: lobby.members.includes(ws)
  };
}

function broadcastLobby() {
  if (lobby) {
    for (const ws of sockets) send(ws, lobbyState(ws));
  }
}

function closeLobby(reason) {
  if (!lobby) return;
  const closed = lobby;
  lobby = null;
  broadcast({ type: "lobby_closed", reason, host: closed.host.username });
}

function openLobby(host, kind) {
  host.kind = kind;
  lobby = {
    host,
    members: [host]
  };
  broadcastLobby();
}

function joinLobby(ws, kind) {
  if (lobby.members.includes(ws)) return;
  if (lobby.members.some((member) => member.username === ws.username)) {
    send(ws, { type: "lobby_error", error: "This account is already in the lobby." });
    return;
  }
  if (lobby.members.length >= LOBBY_MAX_PLAYERS) {
    send(ws, { type: "lobby_error", error: "This lobby is already full." });
    return;
  }
  ws.kind = kind;
  lobby.members.push(ws);
  if (lobby.members.length === LOBBY_MAX_PLAYERS) {
    startRoom(lobby.members);
    closeLobby("started");
  } else {
    broadcastLobby();
  }
}

function leaveLobby(ws) {
  if (!lobby || !lobby.members.includes(ws)) return;
  if (lobby.host === ws) {
    closeLobby("host_left");
    return;
  }
  lobby.members = lobby.members.filter((member) => member !== ws);
  broadcastLobby();
}

function startRoom(members) {
  const room = { id: randomUUID(), players: new Map(), reported: new Set() };
  rooms.set(room.id, room);
  members.forEach((ws, slot) => {
    ws.slot = slot;
    ws.roomId = room.id;
    room.players.set(slot, ws);
  });
  const arenaSeed = Math.random();
  const roster = members.map((ws) => describe(ws));
  members.forEach((ws) => send(ws, { type: "match_start", slot: ws.slot, arenaSeed, players: roster }));
}

function leaveRoom(ws) {
  const room = rooms.get(ws.roomId);
  ws.roomId = null;
  if (!room) return;
  room.players.delete(ws.slot);
  for (const other of room.players.values()) {
    send(other, { type: "player_left", slot: ws.slot });
  }
  if (room.players.size === 0) rooms.delete(room.id);
}

function describe(ws) {
  const account = findAccount(ws.username);
  return { slot: ws.slot, username: ws.username, kind: ws.kind, skin: account ? account.skin : "none" };
}

function validSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return false;
  const numbers = ["x", "y", "z", "vx", "vy", "vz", "facing", "hp", "damage", "stocks",
    "invulnerable", "respawn", "attackPose", "kickPose", "poseTimer", "hitFlash", "powerBoost"];
  const flags = ["grounded", "crouching", "falling", "eliminated"];
  return numbers.every((key) => Number.isFinite(snapshot[key]))
    && flags.every((key) => typeof snapshot[key] === "boolean")
    && (snapshot.facing === 1 || snapshot.facing === -1)
    && snapshot.hp >= 0 && snapshot.hp <= 100
    && snapshot.damage >= 0
    && Number.isInteger(snapshot.stocks) && snapshot.stocks >= 0 && snapshot.stocks <= 4;
}

function validProjectile(projectile) {
  if (!projectile || typeof projectile !== "object" || Array.isArray(projectile)) return false;
  const coordinates = ["x", "y", "z"];
  const velocities = ["vx", "vy", "vz"];
  return coordinates.every((key) => Number.isFinite(projectile[key]) && Math.abs(projectile[key]) <= 1000)
    && velocities.every((key) => Number.isFinite(projectile[key]) && Math.abs(projectile[key]) <= 100)
    && Number.isFinite(projectile.speed) && projectile.speed >= 0 && projectile.speed <= 100
    && Number.isFinite(projectile.life) && projectile.life > 0 && projectile.life <= 7
    && Number.isFinite(projectile.radius) && projectile.radius > 0 && projectile.radius <= 2
    && ["sphere", "star", "wave", "banana"].includes(projectile.shape)
    && typeof projectile.color === "string" && /^#[0-9a-f]{6}$/i.test(projectile.color)
    && typeof projectile.emissive === "string" && /^#[0-9a-f]{6}$/i.test(projectile.emissive)
    && typeof projectile.hazard === "boolean" && typeof projectile.boomerang === "boolean"
    && typeof projectile.homing === "boolean";
}


function handleSocketMessage(ws, raw) {
  let message;
  try {
    message = JSON.parse(raw.toString());
  } catch {
    return;
  }
  if (!message || typeof message !== "object" || Array.isArray(message)) return;

  if (message.type === "host" || message.type === "join") {
    if (typeof message.kind !== "string" || message.kind.length > MAX_KIND_LENGTH) return;
    if (ws.roomId) return;
    if (lobby) {
      joinLobby(ws, message.kind);
    } else if (message.type === "host") {
      openLobby(ws, message.kind);
    } else {
      send(ws, { type: "lobby_error", error: "There is no open lobby to join." });
    }
    return;
  }

  if (message.type === "leave_lobby") {
    leaveLobby(ws);
    return;
  }

  if (message.type === "start_lobby") {
    if (!lobby || lobby.host !== ws) {
      send(ws, { type: "lobby_error", error: "Only the lobby host can start the match." });
    } else if (lobby.members.length < LOBBY_MIN_PLAYERS) {
      send(ws, { type: "lobby_error", error: "At least two players are needed to start." });
    } else {
      startRoom(lobby.members);
      closeLobby("started");
    }
    return;
  }

  if (message.type === "leave") {
    leaveLobby(ws);
    leaveRoom(ws);
    return;
  }

  if (message.type === "result") {
    const room = rooms.get(ws.roomId);
    if (!room || room.reported.has(ws.username)) return;
    room.reported.add(ws.username);
    const account = recordResult(ws.username, Boolean(message.won));
    if (account) send(ws, { type: "result_saved", wins: account.wins, matches: account.matches });
    return;
  }

  if (message.type === "state") {
    const room = rooms.get(ws.roomId);
    if (!room) return;
    if (!validSnapshot(message.snapshot)) {
      send(ws, { type: "protocol_error", error: "Invalid fighter state was not sent." });
      return;
    }
    for (const other of room.players.values()) {
      if (other !== ws) send(other, { type: "state", slot: ws.slot, snapshot: message.snapshot });
    }
    return;
  }

  if (message.type === "projectile") {
    const room = rooms.get(ws.roomId);
    if (!room) return;
    if (!validProjectile(message.projectile)) {
      send(ws, { type: "protocol_error", error: "Invalid projectile was not sent." });
      return;
    }
    for (const other of room.players.values()) {
      if (other !== ws) send(other, { type: "projectile", slot: ws.slot, projectile: message.projectile });
    }
    return;
  }

  if (message.type === "hit") {
    const room = rooms.get(ws.roomId);
    const target = room && room.players.get(message.target);
    if (!target || target === ws) return;
    if (!Number.isFinite(message.damage) || !Number.isFinite(message.force)) return;
    send(target, { type: "hit", from: ws.slot, damage: message.damage, force: message.force });
  }
}

function socketUser(req, url) {
  const token = url.searchParams.get("token");
  return token && sessions.get(token);
}

export async function handleHttp(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (!url.pathname.startsWith("/api/")) {
    res.writeHead(404);
    res.end();
    return;
  }
  try {
    await handleApi(req, res, url);
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Bad request." });
  }
}

const wss = new WebSocketServer({ noServer: true });

// Returns false when the request is not for the game socket.
export function handleUpgrade(req, socket, head) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname !== "/ws") return false;
  const username = socketUser(req, url);
  if (!username) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return true;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    ws.username = username;
    ws.roomId = null;
    ws.kind = null;
    ws.slot = null;
    wss.emit("connection", ws);
  });
  return true;
}

wss.on("connection", (ws) => {
  sockets.add(ws);
  if (lobby) send(ws, lobbyState(ws));
  ws.on("message", (raw) => handleSocketMessage(ws, raw));
  ws.on("close", () => {
    sockets.delete(ws);
    leaveLobby(ws);
    leaveRoom(ws);
  });
});

// Only listen when run directly (npm run server); Vite imports this module to host the game API itself.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  createServer(handleHttp)
    .on("upgrade", (req, socket, head) => {
      if (!handleUpgrade(req, socket, head)) socket.destroy();
    })
    .listen(PORT, () => {
      console.log(`Universe Crazy server listening on http://localhost:${PORT}`);
    });
}
