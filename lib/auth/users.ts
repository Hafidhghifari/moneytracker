import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "../db";

const scrypt = promisify(scryptCallback);

export type UserPreference = "all" | "income" | "expense";
export type PublicUser = { id: string; name: string; email: string; preference: string };

type UserRecord = {
  id: number;
  name: string;
  email: string;
  preference: string | null;
};

function publicUser(user: UserRecord): PublicUser {
  return { id: String(user.id), name: user.name, email: user.email, preference: user.preference ?? "all" };
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

export async function createUser(name: string, email: string, password: string): Promise<PublicUser | null> {
  try {
    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(password), preference: "all" },
      select: { id: true, name: true, email: true, preference: true },
    });
    return publicUser(user);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return null;
    throw error;
  }
}

export async function verifyUser(email: string, password: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const [salt, expectedHex] = user.password.split(":");
  if (!salt || !expectedHex) return null;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual)
    ? publicUser({ id: user.id, name: user.name, email: user.email, preference: user.preference })
    : null;
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  const userId = Number(id);
  if (!Number.isSafeInteger(userId) || userId <= 0) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, preference: true },
  });
  return user ? publicUser(user) : null;
}

export async function getUserSessionVersion(id: string): Promise<number | null> {
  const userId = Number(id);
  if (!Number.isSafeInteger(userId) || userId <= 0) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { sessionVersion: true } });
  return user?.sessionVersion ?? null;
}

export async function revokeUserSessions(id: string): Promise<void> {
  const userId = Number(id);
  if (!Number.isSafeInteger(userId) || userId <= 0) return;
  await prisma.user.updateMany({ where: { id: userId }, data: { sessionVersion: { increment: 1 } } });
}

export async function updateUserPreference(id: string, preference: UserPreference): Promise<void> {
  const userId = Number(id);
  if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("User ID tidak valid");
  await prisma.user.update({ where: { id: userId }, data: { preference } });
}
