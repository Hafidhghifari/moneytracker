import "dotenv/config";
import { getCurrentUserId } from "../lib/auth";
import { prisma } from "../lib/db";
import {
  createTransaction,
  deleteTransaction,
  getRecentTransactions,
  getSummary,
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

  // --- 3. Ringkasan keuangan ----------------------------------------
  const summaryA = await getSummary(userA.id);
  check("income user A", summaryA.income === 1500000, String(summaryA.income));
  check(
    "expense user A",
    summaryA.expense === 125000.5,
    String(summaryA.expense),
  );
  check(
    "balance user A = income - expense",
    summaryA.balance === 1374999.5,
    String(summaryA.balance),
  );

  const summaryB = await getSummary(userB.id);
  check(
    "summary user B terpisah dari user A",
    summaryB.income === 2000000 && summaryB.expense === 500000,
  );

  const summaryKosong = await getSummary(999999);
  check(
    "summary user tanpa transaksi bernilai nol",
    summaryKosong.income === 0 &&
      summaryKosong.expense === 0 &&
      summaryKosong.balance === 0,
  );

  // --- 4. Mutasi & otorisasi ----------------------------------------
  const baselineA = (await getTransactions(userA.id, "all")).length;

  const created = await createTransaction(userA.id, {
    type: "expense",
    amount: 12345.67,
    description: "VERIFY sementara",
    transactionDate: "2026-09-10",
  });

  const stored = await prisma.transaction.findUniqueOrThrow({
    where: { id: created.id },
  });
  check("create menempelkan user_id dari parameter", stored.userId === userA.id);
  check(
    "create menyimpan nominal presisi 2 desimal",
    stored.amount.toString() === "12345.67",
    stored.amount.toString(),
  );
  check(
    "create menyimpan tanggal sebagai date",
    stored.transactionDate.toISOString().slice(0, 10) === "2026-09-10",
  );

  const rawDate = await prisma.$queryRaw<Array<{ value: string }>>`
    SELECT to_char(transaction_date, 'YYYY-MM-DD') AS value
    FROM transactions
    WHERE id = ${created.id}
  `;
  check(
    "tanggal tersimpan benar di database (raw SQL)",
    rawDate[0]?.value === "2026-09-10",
    rawDate[0]?.value,
  );

  check(
    "create menambah jumlah transaksi",
    (await getTransactions(userA.id, "all")).length === baselineA + 1,
  );

  const transactionB = await prisma.transaction.findFirstOrThrow({
    where: { userId: userB.id },
    select: { id: true },
  });
  check(
    "user A tidak bisa menghapus transaksi user B",
    (await deleteTransaction(userA.id, transactionB.id)) === false,
  );
  check(
    "transaksi user B masih ada setelah percobaan hapus",
    (await prisma.transaction.count({ where: { id: transactionB.id } })) === 1,
  );

  check(
    "user A bisa menghapus transaksinya sendiri",
    (await deleteTransaction(userA.id, created.id)) === true,
  );
  check(
    "hapus dua kali mengembalikan false",
    (await deleteTransaction(userA.id, created.id)) === false,
  );
  check(
    "jumlah transaksi kembali ke baseline",
    (await getTransactions(userA.id, "all")).length === baselineA,
  );

  let unknownUserRejected = false;
  try {
    await createTransaction(999999, {
      type: "income",
      amount: 1000,
      description: "Tes FK",
      transactionDate: "2026-09-01",
    });
  } catch {
    unknownUserRejected = true;
  }
  check("create dengan user tidak ada ditolak", unknownUserRejected);

  let deleteUndefinedUserRejected = false;
  try {
    // @ts-expect-error sengaja menguji guard runtime
    await deleteTransaction(undefined, transactionB.id);
  } catch {
    deleteUndefinedUserRejected = true;
  }
  check("delete dengan userId undefined ditolak", deleteUndefinedUserRejected);
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
