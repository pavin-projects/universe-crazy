import { ONLINE_SKINS, unlockedSkins } from "../shared/skins.js";

const TOKEN_KEY = "universeCrazyToken";
const LAST_USER_KEY = "universeCrazyLastUser";

const listeners = {
  onAccountChanged: () => {},
  getFighterKind: () => "bumble",
  onMatchStart: () => {},
  onState: () => {},
  onHit: () => {},
  onPlayerLeft: () => {},
  onDisconnected: () => {},
  onResultSaved: () => {}
};

const NOTICE_HOLD_MS = 2500;

let account = null;
let skins = [];
let socket = null;
let lobby = null;
let noticeText = "";
let noticeTimer = 0;
let countdownTimer = 0;
let lobbyDeadline = 0;
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
  socket.addEventListener("message", (event) => handleMessage(JSON.parse(event.data)));
  socket.addEventListener("close", () => {
    socket = null;
    lobby = null;
    renderLobby();
    if (inMatch) {
      inMatch = false;
      listeners.onDisconnected();
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
    lobby = { host: message.host, players: message.players, max: message.max };
    lobbyDeadline = Date.now() + message.remainingMs;
    clearTimeout(noticeTimer);
    noticeText = "";
    startCountdown();
    renderLobby();
  } else if (message.type === "lobby_closed") {
    lobby = null;
    stopCountdown();
    if (message.reason === "started") {
      noticeText = "";
      renderLobby();
    } else {
      const reasons = {
        expired: "Lobby closed. Six players did not join in time.",
        host_left: `${message.host} closed the lobby.`
      };
      showNotice(reasons[message.reason] || "Lobby closed.", NOTICE_HOLD_MS);
    }
  } else if (message.type === "lobby_error") {
    showNotice(message.error, NOTICE_HOLD_MS);
  } else if (message.type === "match_start") {
    inMatch = true;
    lobby = null;
    stopCountdown();
    noticeText = "";
    renderLobby();
    listeners.onMatchStart(message);
  } else if (message.type === "state") {
    listeners.onState(message);
  } else if (message.type === "hit") {
    listeners.onHit(message);
  } else if (message.type === "player_left") {
    listeners.onPlayerLeft(message.slot);
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

export function reportOnlineResult(won) {
  send({ type: "result", won });
}

function startCountdown() {
  if (!countdownTimer) countdownTimer = setInterval(renderLobby, 250);
}

function stopCountdown() {
  clearInterval(countdownTimer);
  countdownTimer = 0;
}

function renderLobby() {
  const hasNotice = Boolean(noticeText) || Boolean(lobby);
  const show = Boolean(account) && !inMatch && hasNotice;
  els.lobbyNotice.hidden = !show;
  if (!show) return;
  if (!lobby) {
    els.lobbyText.textContent = noticeText;
    els.lobbyJoin.hidden = true;
    els.lobbyLeave.hidden = true;
    return;
  }
  const seconds = Math.max(0, Math.ceil((lobbyDeadline - Date.now()) / 1000));
  const count = lobby.players.length;
  const hosting = lobby.host === account.username;
  const joined = lobby.players.includes(account.username);
  els.lobbyText.textContent = hosting
    ? `You are hosting · ${count}/${lobby.max} players · ${seconds}s left`
    : `Match hosted by ${lobby.host} · ${count}/${lobby.max} players · ${seconds}s to join`;
  els.lobbyJoin.hidden = hosting || joined;
  els.lobbyJoin.disabled = count >= lobby.max;
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
    skinSelect: document.querySelector("#skin-select"),
    logoutButton: document.querySelector("#logout-button"),
    lobbyNotice: document.querySelector("#lobby-notice"),
    lobbyText: document.querySelector("#lobby-text"),
    lobbyJoin: document.querySelector("#lobby-join"),
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
