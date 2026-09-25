import "dotenv/config";
import { getCurrentUserId } from "../lib/auth";
import { prisma } from "../lib/db";
import {
  getRecentTransactions,
  getTransactions,
} from "../lib/transactions/data";
import {
  transactionFilterSchema,
  transactionInputSchema,
} from "../lib/transactions/schema";

// Pembacaan kolom @db.Date harus deterministik di mesin mana pun.
process.env.TZ = "UTC";

let passed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    passed += 1;
    console.log(`  ok  ${name}`);
    return;
  }

  failures.push(detail ? `${name} — ${detail}` : name);
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main(): Promise<void> {
  // --- 1. Validasi schema -------------------------------------------
  const valid = transactionInputSchema.safeParse({
    type: "expense",
    amount: "25000.50",
    description: "Makan siang",
    transactionDate: "2026-09-02",
  });
  check(
    "amount desimal valid diterima",
    valid.success && valid.data.amount === 25000.5,
  );

  for (const amount of ["0", "-5", "12.345", "abc", ""]) {
    const result = transactionInputSchema.safeParse({
      type: "income",
      amount,
      description: "Tes",
      transactionDate: "2026-09-01",
    });
    check(`amount "${amount}" ditolak`, !result.success);
  }

  for (const transactionDate of ["2026-02-31", "2026-9-1", "01-09-2026", ""]) {
    const result = transactionInputSchema.safeParse({
      type: "income",
      amount: "1000",
      description: "Tes",
      transactionDate,
    });
    check(`tanggal "${transactionDate}" ditolak`, !result.success);
  }

  const emptyDescription = transactionInputSchema.safeParse({
    type: "income",
    amount: "1000",
    description: "   ",
    transactionDate: "2026-09-01",
  });
  check("deskripsi kosong ditolak", !emptyDescription.success);

  const badType = transactionInputSchema.safeParse({
    type: "transfer",
    amount: "1000",
    description: "Tes",
    transactionDate: "2026-09-01",
  });
  check("type di luar income/expense ditolak", !badType.success);

  check(
    "filter tidak dikenal jatuh ke all",
    transactionFilterSchema.parse("xyz") === "all",
  );
  check(
    "filter income dipertahankan",
    transactionFilterSchema.parse("income") === "income",
  );

  // --- 2. Pembacaan transaksi ---------------------------------------
  const userA = await prisma.user.findUnique({
    where: { email: "user.a@example.com" },
    select: { id: true },
  });
  const userB = await prisma.user.findUnique({
    where: { email: "user.b@example.com" },
    select: { id: true },
  });
  check("user A hasil seed ditemukan", userA !== null);
  check("user B hasil seed ditemukan", userB !== null);

  if (!userA || !userB) {
    check("seed tersedia untuk suite database", false, "jalankan pnpm db:seed");
    return;
  }

  const currentUserId = await getCurrentUserId();
  check(
    "getCurrentUserId() mengembalikan id user A (stub dev)",
    currentUserId === userA.id,
    String(currentUserId),
  );

  const allA = await getTransactions(userA.id, "all");
  const transactionsB = await prisma.transaction.findMany({
    where: { userId: userB.id },
    select: { id: true },
  });
  const idsB = new Set(transactionsB.map((row) => row.id));

  check(
    "user A hanya melihat transaksinya sendiri",
    allA.every((row) => !idsB.has(row.id)),
  );
  check("user A melihat 3 transaksi", allA.length === 3, `dapat ${allA.length}`);

  const dates = allA.map((row) => row.transactionDate).join(",");
  check(
    "urutan transaksi terbaru dulu",
    dates === "2026-09-03,2026-09-02,2026-09-01",
    dates,
  );

  const incomeA = await getTransactions(userA.id, "income");
  check(
    "filter income hanya berisi income",
    incomeA.length === 1 && incomeA.every((row) => row.type === "income"),
  );

  const expenseA = await getTransactions(userA.id, "expense");
  check(
    "filter expense hanya berisi expense",
    expenseA.length === 2 && expenseA.every((row) => row.type === "expense"),
  );

  const recentA = await getRecentTransactions(userA.id, 2);
  check("recent limit 2", recentA.length === 2);
  check(
    "recent mengambil dari urutan teratas",
    recentA.map((row) => row.id).join(",") ===
      allA.slice(0, 2).map((row) => row.id).join(","),
  );

  let undefinedUserRejected = false;
  try {
    // @ts-expect-error sengaja menguji guard runtime
    await getTransactions(undefined, "all");
  } catch {
    undefinedUserRejected = true;
  }
  check("userId undefined ditolak", undefinedUserRejected);
}

main()
  .catch((error) => {
    failures.push(`unhandled error: ${String(error)}`);
    console.error(error);
  })
  .then(async () => {
    await prisma.$disconnect();
    console.log(`\n${passed} ok, ${failures.length} gagal`);
    if (failures.length > 0) {
      process.exitCode = 1;
    }
  });
