import "dotenv/config";
import { hashPassword } from "../lib/auth/users";
import { prisma } from "../lib/db";

// Pembacaan/penulisan kolom @db.Date harus deterministik di mesin mana pun.
process.env.TZ = "UTC";

type SeedTransaction = {
  type: "income" | "expense";
  amount: string;
  description: string;
  transactionDate: string;
};

const SEED_USERS: Array<{
  name: string;
  email: string;
  password: string;
  transactions: SeedTransaction[];
}> = [
  {
    name: "User A",
    email: "sza@mh.com",
    password: "password123",
    transactions: [
      { type: "income", amount: "1500000.00", description: "Uang saku", transactionDate: "2026-09-01" },
      { type: "expense", amount: "25000.50", description: "Makan siang", transactionDate: "2026-09-02" },
      { type: "expense", amount: "100000.00", description: "Buku", transactionDate: "2026-09-03" },
    ],
  },
  {
    name: "User B",
    email: "abc@mh.com",
    password: "password123",
    transactions: [
      { type: "income", amount: "2000000.00", description: "Uang saku B", transactionDate: "2026-09-01" },
      { type: "expense", amount: "500000.00", description: "Sewa B", transactionDate: "2026-09-04" },
    ],
  },
];

async function main(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed tidak boleh dijalankan di production");
  }

  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  for (const seedUser of SEED_USERS) {
    const user = await prisma.user.create({
      data: {
        name: seedUser.name,
        email: seedUser.email,
        password: await hashPassword(seedUser.password),
      },
    });

    await prisma.transaction.createMany({
      data: seedUser.transactions.map((transaction) => ({
        userId: user.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        transactionDate: new Date(`${transaction.transactionDate}T00:00:00.000Z`),
      })),
    });
  }

  console.log(`Seed selesai: ${SEED_USERS.length} user.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
