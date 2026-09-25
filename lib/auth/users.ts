import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const dataFile = path.join(process.cwd(), "data", "users.json");

export type User = { id: string; name: string; email: string; passwordHash: string; preference: string };
export type PublicUser = Omit<User, "passwordHash">;

function publicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

async function readUsers(): Promise<User[]> {
  try {
    return JSON.parse(await readFile(dataFile, "utf8")) as User[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveUsers(users: User[]) {
  await mkdir(path.dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(users, null, 2), { mode: 0o600 });
}

export async function createUser(name: string, email: string, password: string): Promise<PublicUser | null> {
  const users = await readUsers();
  if (users.some((user) => user.email === email)) return null;
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  const user: User = {
    id: randomBytes(16).toString("hex"), name, email,
    passwordHash: `${salt}:${key.toString("hex")}`, preference: "all",
  };
  users.push(user);
  await saveUsers(users);
  return publicUser(user);
}

export async function verifyUser(email: string, password: string): Promise<PublicUser | null> {
  const user = (await readUsers()).find((candidate) => candidate.email === email);
  if (!user) return null;
  const [salt, expectedHex] = user.passwordHash.split(":");
  if (!salt || !expectedHex) return null;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? publicUser(user) : null;
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  const user = (await readUsers()).find((candidate) => candidate.id === id);
  return user ? publicUser(user) : null;
}
