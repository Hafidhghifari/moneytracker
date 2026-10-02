import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL belum di-set. Salin .env.example menjadi .env.");
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  globalForPrisma.prisma ??= createClient();
  return globalForPrisma.prisma;
}

// Lazily create the client on first use so importing this module
// (e.g. during `next build`) doesn't throw when DATABASE_URL is unset.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getPrisma(), prop);
  },
});
