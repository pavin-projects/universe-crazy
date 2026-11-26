import { ONLINE_SKINS, unlockedSkins } from "../shared/skins.js";
import { swordForWins, nextSwordTier } from "../shared/swords.js";

const TOKEN_KEY = "universeCrazyToken";
const LAST_USER_KEY = "universeCrazyLastUser";

const listeners = {
  onAccountChanged: () => {},
  getFighterKind: () => "bumble",
  onMatchStart: () => {},
  onState: () => {},
  onHit: () => {},
  onProjectile: () => {},
  onPlayerLeft: () => {},
  onDisconnected: () => {},
  onProtocolError: () => {},
  onResultSaved: () => {}
};

const NOTICE_HOLD_MS = 2500;

let account = null;
let skins = [];
let socket = null;
let lobby = null;
let noticeText = "";
let noticeTimer = 0;
let inMatch = false;

const els = {};

export function setOnlineListeners(next) {
  Object.assign(listeners, next);
}

export function currentAccount() {
  return account;
}

export function isSignedIn() {
  return Boolean(account);
}

export function currentSkinId() {
  return account ? account.skin : "none";
}

export function isInOnlineMatch() {
  return inMatch;
}

function token() {
  return localStorage.getItem(TOKEN_KEY);
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const response = await fetch(path, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Something went wrong.");
  return body;
}

function setAccount(next, nextSkins) {
  account = next;
  skins = nextSkins || (next ? unlockedSkins(next.wins) : []);
  renderAccount();
  renderLobby();
  listeners.onAccountChanged(account);
}

function storeSession(body) {
  localStorage.setItem(TOKEN_KEY, body.token);
  localStorage.setItem(LAST_USER_KEY, body.account.username);
  setAccount(body.account);
  connectSocket();
}

export async function restoreSession() {
  if (!token()) return;
  try {
    const body = await api("/api/me");
    setAccount(body.account, body.skins);
    connectSocket();
  } catch {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function signUp(username, password, confirm) {
  if (password !== confirm) throw new Error("Passwords do not match.");
  const body = await api("/api/signup", { method: "POST", body: JSON.stringify({ username, password }) });
  storeSession(body);
}

export async function logIn(username, password) {
  const body = await api("/api/login", { method: "POST", body: JSON.stringify({ username, password }) });
  storeSession(body);
}

export async function logOut() {
  await api("/api/logout", { method: "POST" }).catch(() => {});
  leaveMatch();
  socket?.close();
  socket = null;
  lobby = null;
  localStorage.removeItem(TOKEN_KEY);
  setAccount(null);
}

export async function chooseSkin(skinId) {
  const body = await api("/api/skin", { method: "POST", body: JSON.stringify({ skin: skinId }) });
  setAccount(body.account);
}

function connectSocket() {
  if (socket && socket.readyState <= WebSocket.OPEN) return;
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${protocol}//${location.host}/ws?token=${encodeURIComponent(token())}`);
  const connectedSocket = socket;
  connectedSocket.addEventListener("message", (event) => handleMessage(JSON.parse(event.data)));
  connectedSocket.addEventListener("close", () => {
    if (socket !== connectedSocket) return;
    socket = null;
    lobby = null;
    renderLobby();
    if (inMatch) {
      inMatch = false;
      listeners.onDisconnected();
    } else if (account) {
      showNotice("Connection lost. Choose online play to reconnect.", NOTICE_HOLD_MS);
    }
  });
}

function send(message) {
  if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function showNotice(text, holdMs = 0) {
  clearTimeout(noticeTimer);
  noticeText = text;
  if (holdMs) {
    noticeTimer = setTimeout(() => {
      noticeText = "";
      renderLobby();
    }, holdMs);
  }
  renderLobby();
}

function handleMessage(message) {
  if (message.type === "lobby") {
    lobby = {
      host: message.host, players: message.players, max: message.max,
      isHost: message.isHost, isJoined: message.isJoined
    };
    clearTimeout(noticeTimer);
    noticeText = "";
    renderLobby();
  } else if (message.type === "lobby_closed") {
    lobby = null;
    if (message.reason === "started") {
      noticeText = "";
      renderLobby();
    } else {
      const reasons = {
        host_left: `${message.host} closed the lobby.`
      };
      showNotice(reasons[message.reason] || "Lobby closed.", NOTICE_HOLD_MS);
    }
  } else if (message.type === "lobby_error") {
    showNotice(message.error, NOTICE_HOLD_MS);
  } else if (message.type === "match_start") {
    inMatch = true;
    lobby = null;
    noticeText = "";
    renderLobby();
    listeners.onMatchStart(message);
  } else if (message.type === "state") {
    listeners.onState(message);
  } else if (message.type === "hit") {
    listeners.onHit(message);
  } else if (message.type === "projectile") {
    listeners.onProjectile(message);
  } else if (message.type === "player_left") {
    listeners.onPlayerLeft(message.slot);
  } else if (message.type === "protocol_error") {
    listeners.onProtocolError(message.error);
  } else if (message.type === "result_saved") {
    if (account) account = { ...account, wins: message.wins, matches: message.matches };
    renderAccount();
    listeners.onResultSaved(message);
  }
}

// Hosts a lobby, or joins the open one if someone else is already hosting
export function hostOrJoinMatch(kind) {
  if (!account) return false;
  if (!socket || socket.readyState !== WebSocket.OPEN) connectSocket();
  if (socket.readyState !== WebSocket.OPEN) showNotice("Connecting to the online lobby…");
  const type = lobby ? "join" : "host";
  const sendRequest = () => send({ type, kind });
  if (socket.readyState === WebSocket.OPEN) sendRequest();
  else socket.addEventListener("open", sendRequest, { once: true });
  return true;
}

export function joinOpenLobby() {
  send({ type: "join", kind: listeners.getFighterKind() });
}

export function leaveLobbyNotice() {
  send({ type: "leave_lobby" });
}

export function startLobby() {
  send({ type: "start_lobby" });
}

export function leaveMatch() {
  if (inMatch) send({ type: "leave" });
  inMatch = false;
}

export function sendOnlineState(payload) {
  send({ type: "state", ...payload });
}

export function sendOnlineHit(target, damage, force) {
  send({ type: "hit", target, damage, force });
}

export function sendOnlineProjectile(projectile) {
  send({ type: "projectile", projectile });
}

export function reportOnlineResult(won) {
  send({ type: "result", won });
}

function renderLobby() {
  const hasNotice = Boolean(noticeText) || Boolean(lobby);
  const show = Boolean(account) && !inMatch && hasNotice;
  els.lobbyNotice.hidden = !show;
  if (!show) return;
  if (!lobby) {
    els.lobbyText.textContent = noticeText;
    els.lobbyJoin.hidden = true;
    els.lobbyStart.hidden = true;
    els.lobbyLeave.hidden = true;
    return;
  }
  const count = lobby.players.length;
  const hosting = lobby.isHost;
  const joined = lobby.isJoined;
  els.lobbyText.textContent = noticeText || (hosting
    ? `Hosting · ${count}/${lobby.max} players`
    : `${lobby.host}'s lobby · ${count}/${lobby.max} players`);
  els.lobbyJoin.hidden = hosting || joined;
  els.lobbyJoin.disabled = count >= lobby.max;
  els.lobbyStart.hidden = !hosting;
  els.lobbyStart.disabled = count < 2;
  els.lobbyLeave.hidden = !(hosting || joined);
  els.lobbyLeave.textContent = hosting ? "Cancel lobby" : "Leave";
}

function setAccountStatus(text) {
  els.accountStatus.textContent = text;
}

function renderAccount() {
  const signedIn = Boolean(account);
  els.signedOut.hidden = signedIn;
  els.signedIn.hidden = !signedIn;
  els.openButton.classList.toggle("is-signed-in", signedIn);
  els.openButton.title = signedIn ? `Signed in as ${account.username}` : "Sign up or log in";
  if (!signedIn) return;
  els.welcome.textContent = `Signed in as ${account.username}`;
  els.record.textContent = `${account.wins} wins · ${account.matches} online matches`;
  // The moon grows and glows as wins climb toward the 30-win Trillion Blade
  const progress = Math.min(account.wins, 30) / 30;
  els.moon.style.setProperty("--moon-scale", (0.6 + progress * 0.8).toFixed(3));
  els.moon.style.setProperty("--moon-glow", (0.2 + progress * 0.8).toFixed(3));
  const equipped = swordForWins(account.wins);
  const next = nextSwordTier(account.wins);
  els.sword.textContent = equipped
    ? `Sword: ${equipped.label}${next ? ` · next: ${next.label} at ${next.wins} wins` : " · max tier reached"}`
    : `No sword yet. Win ${nextSwordTier(0).wins} online match to unlock one.`;
  els.skinSelect.innerHTML = ONLINE_SKINS.map((skin) => {
    const unlocked = skins.some((owned) => owned.id === skin.id);
    const label = unlocked ? skin.label : `${skin.label} (${skin.wins} wins)`;
    return `<option value="${skin.id}" ${unlocked ? "" : "disabled"}>${label}</option>`;
  }).join("");
  els.skinSelect.value = account.skin;
}

function showAuthMode(mode) {
  const isSignup = mode === "signup";
  els.signupForm.hidden = !isSignup;
  els.loginForm.hidden = isSignup;
  els.tabSignup.classList.toggle("is-active", isSignup);
  els.tabLogin.classList.toggle("is-active", !isSignup);
  setAccountStatus("");
  if (!isSignup) {
    const remembered = localStorage.getItem(LAST_USER_KEY) || "";
    els.loginUser.value = remembered;
    els.loginUserRow.hidden = Boolean(remembered);
    els.loginPassword.focus();
  } else {
    els.signupUser.focus();
  }
}

function openAccountModal(mode = "login") {
  els.modal.hidden = false;
  showAuthMode(mode);
}

export function openAccountFor(reason) {
  openAccountModal("login");
  if (reason) setAccountStatus(reason);
}

function closeAccountModal() {
  els.modal.hidden = true;
}

function bindForm(form, handler) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector("button[type=submit]");
    submit.disabled = true;
    setAccountStatus("Working…");
    try {
      await handler();
      setAccountStatus("");
      form.reset();
      if (account) closeAccountModal();
    } catch (error) {
      setAccountStatus(error.message);
    } finally {
      submit.disabled = false;
    }
  });
}

export function initOnlineUi() {
  // The moon's eyes follow the cursor so it keeps an eye on you
  document.addEventListener("pointermove", (event) => {
    if (!els.moon || els.modal.hidden || els.signedIn.hidden) return;
    const rect = els.moon.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy) || 1;
    const offset = Math.min(distance, 60) / 60 * 4;
    els.moon.style.setProperty("--look-x", `${((dx / distance) * offset).toFixed(2)}px`);
    els.moon.style.setProperty("--look-y", `${((dy / distance) * offset).toFixed(2)}px`);
  });

  Object.assign(els, {
    openButton: document.querySelector("#open-account"),
    modal: document.querySelector("#account-modal"),
    closeButton: document.querySelector("#close-account"),
    signedOut: document.querySelector("#account-signed-out"),
    signedIn: document.querySelector("#account-signed-in"),
    tabSignup: document.querySelector("#auth-tab-signup"),
    tabLogin: document.querySelector("#auth-tab-login"),
    signupForm: document.querySelector("#signup-form"),
    signupUser: document.querySelector("#signup-username"),
    signupPassword: document.querySelector("#signup-password"),
    signupConfirm: document.querySelector("#signup-confirm"),
    loginForm: document.querySelector("#login-form"),
    loginUserRow: document.querySelector("#login-user-row"),
    loginUser: document.querySelector("#login-username"),
    loginPassword: document.querySelector("#login-password"),
    accountStatus: document.querySelector("#account-status"),
    welcome: document.querySelector("#account-welcome"),
    record: document.querySelector("#account-record"),
    moon: document.querySelector("#account-moon"),
    sword: document.querySelector("#account-sword"),
    skinSelect: document.querySelector("#skin-select"),
    logoutButton: document.querySelector("#logout-button"),
    lobbyNotice: document.querySelector("#lobby-notice"),
    lobbyText: document.querySelector("#lobby-text"),
    lobbyJoin: document.querySelector("#lobby-join"),
    lobbyStart: document.querySelector("#lobby-start"),
    lobbyLeave: document.querySelector("#lobby-leave")
  });

  els.openButton.addEventListener("click", () => {
    if (account) {
      els.modal.hidden = !els.modal.hidden;
      renderAccount();
    } else {
      openAccountModal("login");
    }
  });
  els.closeButton.addEventListener("click", closeAccountModal);
  els.tabSignup.addEventListener("click", () => showAuthMode("signup"));
  els.tabLogin.addEventListener("click", () => showAuthMode("login"));
  els.lobbyJoin.addEventListener("click", () => joinOpenLobby());
  els.lobbyStart.addEventListener("click", () => startLobby());
  els.lobbyLeave.addEventListener("click", () => leaveLobbyNotice());
  els.logoutButton.addEventListener("click", () => logOut());
  els.skinSelect.addEventListener("change", async () => {
    try {
      await chooseSkin(els.skinSelect.value);
      setAccountStatus("Skin saved.");
    } catch (error) {
      setAccountStatus(error.message);
    }
  });

  bindForm(els.signupForm, () =>
    signUp(els.signupUser.value.trim(), els.signupPassword.value, els.signupConfirm.value)
  );
  bindForm(els.loginForm, () => {
    const username = els.loginUserRow.hidden ? localStorage.getItem(LAST_USER_KEY) : els.loginUser.value.trim();
    return logIn(username, els.loginPassword.value);
  });

  renderAccount();
  showAuthMode("login");
}
