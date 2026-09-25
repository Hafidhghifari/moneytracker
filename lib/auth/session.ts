import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { findUserById, getUserSessionVersion, revokeUserSessions, type PublicUser } from "./users";

const cookieName = "moneyhist_session";
const sessionLifetime = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!value || value.length < 32 || value.startsWith("ganti-dengan-") || value === "development-only-secret-change-me")) {
    throw new Error("AUTH_SECRET must be a unique random value of at least 32 characters in production");
  }
  return value ?? "development-only-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export async function createSession(userId: string) {
  const sessionVersion = await getUserSessionVersion(userId);
  if (sessionVersion === null) throw new Error("User session tidak ditemukan");
  const payload = Buffer.from(JSON.stringify({ userId, sessionVersion, expiresAt: Date.now() + sessionLifetime * 1000, nonce: randomBytes(12).toString("hex") })).toString("base64url");
  const store = await cookies();
  store.set(cookieName, `${payload}.${sign(payload)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: sessionLifetime,
  });
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const actual = Buffer.from(signature);
  const expected = Buffer.from(sign(payload));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId: string; sessionVersion: number; expiresAt: number };
    if (typeof session.userId !== "string" || !Number.isSafeInteger(session.sessionVersion) || typeof session.expiresAt !== "number" || session.expiresAt <= Date.now()) return null;
    if (await getUserSessionVersion(session.userId) !== session.sessionVersion) return null;
    return findUserById(session.userId);
  } catch {
    return null;
  }
}

export async function requireCurrentUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  try {
    if (token) {
      const [payload, signature] = token.split(".");
      if (payload && signature) {
        const actual = Buffer.from(signature);
        const expected = Buffer.from(sign(payload));
        if (actual.length === expected.length && timingSafeEqual(actual, expected)) {
          const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId?: unknown };
          if (typeof session.userId === "string") await revokeUserSessions(session.userId);
        }
      }
    }
  } finally {
    store.delete(cookieName);
  }
}
