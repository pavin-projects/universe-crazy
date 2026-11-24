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
const LOBBY_WINDOW_MS = 35000;

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

function lobbyState() {
  return {
    type: "lobby",
    host: lobby.host.username,
    players: lobby.members.map((ws) => ws.username),
    max: LOBBY_MAX_PLAYERS,
    remainingMs: Math.max(0, lobby.expiresAt - Date.now())
  };
}

function broadcastLobby() {
  if (lobby) broadcast(lobbyState());
}

function closeLobby(reason) {
  if (!lobby) return;
  clearTimeout(lobby.timer);
  const closed = lobby;
  lobby = null;
  broadcast({ type: "lobby_closed", reason, host: closed.host.username });
}

function openLobby(host, kind) {
  host.kind = kind;
  lobby = {
    host,
    members: [host],
    expiresAt: Date.now() + LOBBY_WINDOW_MS,
    timer: setTimeout(() => closeLobby("expired"), LOBBY_WINDOW_MS)
  };
  broadcastLobby();
}

function joinLobby(ws, kind) {
  if (lobby.members.includes(ws)) return;
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


function handleSocketMessage(ws, raw) {
  let message;
  try {
    message = JSON.parse(raw.toString());
  } catch {
    return;
  }

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
    if (!message.snapshot || typeof message.snapshot !== "object") return;
    const room = rooms.get(ws.roomId);
    if (!room) return;
    for (const other of room.players.values()) {
      if (other !== ws) send(other, { type: "state", slot: ws.slot, snapshot: message.snapshot });
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
  if (lobby) send(ws, lobbyState());
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
