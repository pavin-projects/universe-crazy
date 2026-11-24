import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "data");
const dataFile = join(dataDir, "accounts.json");

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,16}$/;
const MIN_PASSWORD_LENGTH = 8;

let accounts = load();

function load() {
  if (!existsSync(dataFile)) return new Map();
  const raw = JSON.parse(readFileSync(dataFile, "utf8"));
  return new Map(raw.map((account) => [account.key, account]));
}

function save() {
  mkdirSync(dataDir, { recursive: true });
  const tmp = `${dataFile}.tmp`;
  writeFileSync(tmp, JSON.stringify([...accounts.values()], null, 2));
  renameSync(tmp, dataFile);
}

function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString("hex");
}

export function validateSignup(username, password) {
  if (typeof username !== "string" || !USERNAME_PATTERN.test(username)) {
    return "Username must be 3-16 letters, digits or underscores.";
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export function publicAccount(account) {
  return {
    username: account.username,
    wins: account.wins,
    matches: account.matches,
    skin: account.skin
  };
}

export function createAccount(username, password) {
  const key = username.toLowerCase();
  if (accounts.has(key)) return { error: "That username is already taken." };
  const salt = randomBytes(16).toString("hex");
  const account = {
    key,
    username,
    salt,
    passwordHash: hashPassword(password, salt),
    wins: 0,
    matches: 0,
    skin: "none"
  };
  accounts.set(key, account);
  save();
  return { account };
}

export function checkLogin(username, password) {
  const account = accounts.get(String(username || "").toLowerCase());
  if (!account || typeof password !== "string") return null;
  const actual = Buffer.from(hashPassword(password, account.salt), "hex");
  const expected = Buffer.from(account.passwordHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected) ? account : null;
}

export function findAccount(username) {
  return accounts.get(String(username || "").toLowerCase()) || null;
}

export function recordResult(username, won) {
  const account = findAccount(username);
  if (!account) return null;
  account.matches += 1;
  if (won) account.wins += 1;
  save();
  return account;
}

export function setSkin(username, skin) {
  const account = findAccount(username);
  if (!account) return null;
  account.skin = skin;
  save();
  return account;
}
