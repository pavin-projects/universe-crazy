import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { cpSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { WebSocket } from "ws";

test("lobbies start with two or six players and relay room events", async (t) => {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const fixture = mkdtempSync(join(root, ".lobby-test-"));
  const sockets = [];
  let server;
  t.after(async () => {
    for (const socket of sockets) socket.terminate();
    if (server) await new Promise((resolve) => server.close(resolve));
    rmSync(fixture, { recursive: true, force: true });
  });
  mkdirSync(join(fixture, "server"));
  mkdirSync(join(fixture, "shared"));
  cpSync(join(root, "package.json"), join(fixture, "package.json"));
  cpSync(join(root, "server", "index.js"), join(fixture, "server", "index.js"));
  cpSync(join(root, "server", "store.js"), join(fixture, "server", "store.js"));
  cpSync(join(root, "shared", "skins.js"), join(fixture, "shared", "skins.js"));

  const { handleHttp, handleUpgrade } = await import(pathToFileURL(join(fixture, "server", "index.js")));
  server = createServer(handleHttp);
  server.on("upgrade", (req, socket, head) => {
    if (!handleUpgrade(req, socket, head)) socket.destroy();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  async function connect(token) {
    const socket = new WebSocket(`${base.replace("http:", "ws:")}/ws?token=${token}`);
    sockets.push(socket);
    const messages = [];
    socket.on("message", (data) => messages.push(JSON.parse(data)));
    await new Promise((resolve, reject) => {
      socket.once("open", resolve);
      socket.once("error", reject);
    });
    return {
      socket,
      send: (message) => socket.send(JSON.stringify(message)),
      async next(type, predicate = () => true) {
        const deadline = Date.now() + 3000;
        while (Date.now() < deadline) {
          const index = messages.findIndex((message) => message.type === type && predicate(message));
          if (index >= 0) return messages.splice(index, 1)[0];
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        assert.fail(`Timed out waiting for ${type}`);
      }
    };
  }

  const clients = [];
  for (let index = 0; index < 6; index += 1) {
    const response = await fetch(`${base}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: `player${index}`, password: "test-password" })
    });
    assert.equal(response.status, 201);
    clients.push(await connect((await response.json()).token));
  }
  const [host, guest] = clients;
  host.send(null);
  host.send({ type: "host", kind: "bumble" });
  await host.next("lobby", (message) => message.players.length === 1);
  host.send({ type: "start_lobby" });
  assert.match((await host.next("lobby_error")).error, /two players/i);
  guest.send({ type: "join", kind: "robot" });
  await host.next("lobby", (message) => message.players.length === 2);
  guest.send({ type: "start_lobby" });
  assert.match((await guest.next("lobby_error")).error, /host/i);
  host.send({ type: "start_lobby" });
  const twoStarts = await Promise.all([host.next("match_start"), guest.next("match_start")]);
  assert.equal(twoStarts[0].players.length, 2);
  assert.equal(twoStarts[0].arenaSeed, twoStarts[1].arenaSeed);
  guest.send({ type: "leave" });
  assert.equal((await host.next("player_left")).slot, twoStarts[1].slot);
  host.send({ type: "leave" });

  host.send({ type: "host", kind: "bumble" });
  await host.next("lobby", (message) => message.players.length === 1);
  for (let index = 1; index < clients.length; index += 1) {
    clients[index].send({ type: "join", kind: "robot" });
    if (index < 5) await host.next("lobby", (message) => message.players.length === index + 1);
  }
  const starts = await Promise.all(clients.map((client) => client.next("match_start")));
  assert.deepEqual(starts.map((message) => message.slot), [0, 1, 2, 3, 4, 5]);
  assert.ok(starts.every((message) => message.players.length === 6 && message.arenaSeed === starts[0].arenaSeed));
  clients[5].send({ type: "state", snapshot: { x: 42 } });
  const state = await host.next("state");
  assert.deepEqual(state.snapshot, { x: 42 });
  assert.equal(state.slot, 5);
  clients[5].send({ type: "leave" });
  assert.equal((await host.next("player_left")).slot, 5);
});
