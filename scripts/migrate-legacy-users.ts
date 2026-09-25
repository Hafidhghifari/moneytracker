import "dotenv/config";
import { readFile } from "node:fs/promises";
import { prisma } from "../lib/db";

type LegacyUser = {
  name: string;
  email: string;
  passwordHash: string;
  preference?: string;
};

async function main() {
  const raw = await readFile("data/users.json", "utf8");
  const users = JSON.parse(raw) as unknown;
  if (!Array.isArray(users)) throw new Error("Format file user lama tidak valid.");

  let imported = 0;
  let alreadyPresent = 0;
  await prisma.$transaction(async (transaction) => {
    for (const candidate of users) {
      const user = candidate as Partial<LegacyUser>;
      if (
        typeof user.name !== "string" ||
        typeof user.email !== "string" ||
        typeof user.passwordHash !== "string" ||
        !/^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(user.passwordHash)
      ) {
        throw new Error("Ada data akun lama yang tidak valid; file tidak dihapus.");
      }

      const email = user.email.trim().toLowerCase();
      const existing = await transaction.user.findUnique({ where: { email }, select: { id: true } });
      if (existing) {
        alreadyPresent += 1;
        continue;
      }

      await transaction.user.create({
        data: {
          name: user.name.trim(),
          email,
          password: user.passwordHash,
          preference: typeof user.preference === "string" ? user.preference : "all",
        },
      });
      imported += 1;
    }
  });

  console.log(`Akun lama dipindahkan: ${imported}; sudah ada di database: ${alreadyPresent}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Migrasi akun lama gagal.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
