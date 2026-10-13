import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "leafgenix_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;
const DEV_USERNAME = "leafgenix-admin";
const DEV_PASSWORD_SHA256 =
  "23c7576834fea09e0d5556aabefbba8cc60e3d506c577dc12ad2b45a057ae173";
const DEV_SESSION_SECRET =
  "0Snzku2BDwlQ3MF8x6V9mp38oN6p6x71Sqap1dxV9D4";

type AdminSessionPayload = {
  role: "admin";
  username: string;
  exp: number;
};

function configuredUsername() {
  return process.env.ADMIN_PORTAL_USERNAME?.trim() ||
    (process.env.NODE_ENV !== "production" ? DEV_USERNAME : "");
}
function configuredPasswordHash() {
  const password = process.env.ADMIN_PORTAL_PASSWORD;
  if (password) return createHash("sha256").update(password).digest("hex");
  return process.env.NODE_ENV !== "production" ? DEV_PASSWORD_SHA256 : "";
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() ||
    (process.env.NODE_ENV !== "production" ? DEV_SESSION_SECRET : "");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(payload: string) {
  const secret = sessionSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function adminAuthConfigured() {
  return Boolean(
    configuredUsername() && configuredPasswordHash() && sessionSecret(),
  );
}

export function verifyAdminCredentials(username: string, password: string) {
  if (!adminAuthConfigured()) return false;
  const passwordHash = createHash("sha256").update(password).digest("hex");
  return (
    safeEqual(username.trim(), configuredUsername()) &&
    safeEqual(passwordHash, configuredPasswordHash())
  );
}

export function createAdminToken(username: string) {
  const payload: AdminSessionPayload = {
    role: "admin",
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyAdminToken(token: string | undefined) {
  if (!token || !adminAuthConfigured()) return null;
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra || !safeEqual(signature, sign(encoded))) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as AdminSessionPayload;
    if (
      payload.role !== "admin" ||
      payload.username !== configuredUsername() ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(COOKIE_NAME)?.value);
}

export function adminCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: SESSION_SECONDS,
    path: "/",
    priority: "high" as const,
  };
}

export function expiredAdminCookie() {
  return { ...adminCookie(""), maxAge: 0 };
}
