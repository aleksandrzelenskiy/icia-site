import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import nodemailer from "nodemailer";

type MagicTokenRecord = {
  hash: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  usedAt?: number;
  requestedIp?: string;
};

type MagicTokenStore = {
  tokens: MagicTokenRecord[];
};

const MAGIC_TOKEN_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const TOKEN_STORE_DIR = path.join(process.cwd(), "content", ".admin-auth");
const TOKEN_STORE_FILE = path.join(TOKEN_STORE_DIR, "magic-tokens.json");
const SESSION_COOKIE_NAME = "icia_admin_session";

const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
};

const getSessionSecret = () => requiredEnv("ADMIN_SESSION_SECRET");
const getMagicSecret = () => requiredEnv("ADMIN_MAGIC_LINK_SECRET");

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const getAllowedEmails = () =>
  (process.env.ADMIN_EMAIL_ALLOWLIST || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);

const hashMagicToken = (token: string) =>
  createHmac("sha256", getMagicSecret()).update(token).digest("hex");

const signSessionPayload = (payload: string) =>
  createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");

const parseCookieHeader = (cookieHeader: string | null) => {
  const result = new Map<string, string>();
  if (!cookieHeader) return result;

  for (const chunk of cookieHeader.split(";")) {
    const [rawKey, ...rest] = chunk.split("=");
    if (!rawKey || rest.length === 0) continue;
    result.set(rawKey.trim(), rest.join("=").trim());
  }

  return result;
};

const readTokenStore = async (): Promise<MagicTokenStore> => {
  await fs.mkdir(TOKEN_STORE_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(TOKEN_STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as MagicTokenStore;
    if (!Array.isArray(parsed.tokens)) return { tokens: [] };
    return parsed;
  } catch {
    return { tokens: [] };
  }
};

const writeTokenStore = async (store: MagicTokenStore) => {
  await fs.mkdir(TOKEN_STORE_DIR, { recursive: true });
  await fs.writeFile(TOKEN_STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
};

const pruneTokens = (tokens: MagicTokenRecord[]) => {
  const now = Date.now();
  return tokens.filter(
    (token) =>
      token.expiresAt >= now &&
      !(token.usedAt && token.usedAt < now - 24 * 60 * 60 * 1000)
  );
};

const getMailerConfig = () => {
  const host = process.env.ADMIN_EMAIL_HOST || process.env.CONTACT_EMAIL_HOST;
  const port = Number(process.env.ADMIN_EMAIL_PORT || process.env.CONTACT_EMAIL_PORT);
  const user = process.env.ADMIN_EMAIL_USER || process.env.CONTACT_EMAIL_USER;
  const pass = process.env.ADMIN_EMAIL_PASS || process.env.CONTACT_EMAIL_PASS;
  const secure =
    (process.env.ADMIN_EMAIL_SECURE || process.env.CONTACT_EMAIL_SECURE || "false") ===
    "true";
  const from = process.env.ADMIN_EMAIL_FROM || process.env.CONTACT_EMAIL_FROM;

  if (!host || !port || !user || !pass || !from) {
    throw new Error("Admin mailer is not configured");
  }

  return { host, port, user, pass, secure, from };
};

export const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
};

export const isAdminEmailAllowed = (email: string) => {
  const normalized = normalizeEmail(email);
  return getAllowedEmails().includes(normalized);
};

export const createMagicLinkToken = async (email: string, requestedIp: string) => {
  const rawToken = randomBytes(32).toString("base64url");
  const hash = hashMagicToken(rawToken);
  const now = Date.now();

  const store = await readTokenStore();
  const tokens = pruneTokens(store.tokens);
  tokens.push({
    hash,
    email: normalizeEmail(email),
    createdAt: now,
    expiresAt: now + MAGIC_TOKEN_TTL_MS,
    requestedIp
  });
  await writeTokenStore({ tokens });

  return rawToken;
};

export const consumeMagicLinkToken = async (rawToken: string) => {
  if (!rawToken) return null;
  const tokenHash = hashMagicToken(rawToken);
  const now = Date.now();

  const store = await readTokenStore();
  const tokens = pruneTokens(store.tokens);
  const idx = tokens.findIndex((record) => record.hash === tokenHash);
  if (idx === -1) {
    await writeTokenStore({ tokens });
    return null;
  }

  const record = tokens[idx];
  if (record.usedAt || record.expiresAt < now) {
    await writeTokenStore({ tokens });
    return null;
  }

  tokens[idx] = { ...record, usedAt: now };
  await writeTokenStore({ tokens });
  return record.email;
};

export const issueAdminSessionToken = (email: string) => {
  const payload = JSON.stringify({
    email: normalizeEmail(email),
    exp: Date.now() + SESSION_TTL_MS
  });
  const payloadEncoded = Buffer.from(payload).toString("base64url");
  const signature = signSessionPayload(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
};

export const verifyAdminSessionToken = (token: string | undefined | null) => {
  if (!token) return null;
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return null;

  const expectedSignature = signSessionPayload(payloadEncoded);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(payloadEncoded, "base64url").toString("utf-8")
    ) as { email?: string; exp?: number };

    if (!payload?.email || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    if (!isAdminEmailAllowed(payload.email)) return null;
    return { email: normalizeEmail(payload.email), exp: payload.exp };
  } catch {
    return null;
  }
};

export const getAdminSessionFromCookieHeader = (cookieHeader: string | null) => {
  const cookies = parseCookieHeader(cookieHeader);
  const token = cookies.get(SESSION_COOKIE_NAME);
  return verifyAdminSessionToken(token ?? null);
};

export const isAdminRequestAuthorized = (request: Request) =>
  Boolean(getAdminSessionFromCookieHeader(request.headers.get("cookie")));

export const getAdminSessionCookieName = () => SESSION_COOKIE_NAME;

export const sendAdminMagicLinkEmail = async (email: string, link: string) => {
  const config = getMailerConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass }
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Вход в админку ICIA",
    text: [
      "Вы запросили вход в админку ICIA.",
      "",
      `Ссылка для входа: ${link}`,
      "",
      "Ссылка действует 10 минут и одноразовая."
    ].join("\n")
  });
};

export const buildAdminVerifyUrl = (request: Request, token: string) => {
  const baseUrl = process.env.ADMIN_BASE_URL || new URL(request.url).origin;
  return `${baseUrl}/admin/verify?token=${encodeURIComponent(token)}`;
};
