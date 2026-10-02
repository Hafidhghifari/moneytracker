import "dotenv/config";
import { prisma } from "../lib/db";
import {
  getBudget,
  getBudgetSummary,
  getMonthlyExpenseTotal,
  setBudget,
} from "../lib/budget/data";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
} from "../lib/transactions/data";
import { toWireTransaction } from "../lib/transactions/wire";

// Pembacaan/penulisan kolom @db.Date harus deterministik di mesin mana pun.
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
  const userA = await prisma.user.findUnique({
    where: { email: "sza@mh.com" },
    select: { id: true },
  });
  const userB = await prisma.user.findUnique({
    where: { email: "abc@mh.com" },
    select: { id: true },
  });
  check("user A hasil seed ditemukan", userA !== null);
  check("user B hasil seed ditemukan", userB !== null);
  if (!userA || !userB) {
    return;
  }

  // --- 1. Budget Summary dari data seed (FR-17) -----------------------
  const sept = { year: 2026, month: 9 };

  const summaryA = await getBudgetSummary(userA.id, sept);
  check("budget A September terbaca", summaryA.hasBudget === true);
  check(
    "anggaran A September = 2.000.000",
    summaryA.budget === 2_000_000,
    String(summaryA.budget),
  );
  check(
    "total pengeluaran A September hanya dari expense",
    summaryA.totalExpense === 125_000.5,
    String(summaryA.totalExpense),
  );
  check(
    "sisa anggaran A = anggaran - pengeluaran",
    summaryA.remaining === 1_874_999.5,
    String(summaryA.remaining),
  );

  const summaryB = await getBudgetSummary(userB.id, sept);
  check(
    "summary user B terpisah dari user A",
    summaryB.budget === 1_000_000 &&
      summaryB.totalExpense === 500_000 &&
      summaryB.remaining === 500_000,
    JSON.stringify(summaryB),
  );

  // --- 2. Integrasi budget dengan transaksi pengeluaran (FR-21) -------
  const aug = { year: 2026, month: 8 };
  await setBudget(userA.id, { year: 2026, month: 8, amount: 2_000_000 });
  await setBudget(userB.id, { year: 2026, month: 8, amount: 5_000_000 });

  const createdA: number[] = [];
  const expenseSeed = [
    { amount: 500_000, description: "VERIFY Makan", transactionDate: "2026-08-05" },
    { amount: 300_000, description: "VERIFY Transport", transactionDate: "2026-08-10" },
    { amount: 200_000, description: "VERIFY Belanja", transactionDate: "2026-08-15" },
  ] as const;

  for (const expense of expenseSeed) {
    const row = await createTransaction(userA.id, {
      type: "expense",
      amount: expense.amount,
      description: expense.description,
      transactionDate: expense.transactionDate,
    });
    createdA.push(row.id);
  }

  // Pemasukan tidak boleh dihitung sebagai pengeluaran budget.
  const incomeA = await createTransaction(userA.id, {
    type: "income",
    amount: 999_000,
    description: "VERIFY Pemasukan",
    transactionDate: "2026-08-20",
  });
  createdA.push(incomeA.id);

  // Pengeluaran user B pada bulan yang sama tidak boleh masuk perhitungan A.
  const expenseB = await createTransaction(userB.id, {
    type: "expense",
    amount: 777_000,
    description: "VERIFY Pengeluaran B",
    transactionDate: "2026-08-06",
  });

  const totalAugA = await getMonthlyExpenseTotal(userA.id, aug);
  check(
    "total pengeluaran A Agustus = 1.000.000 (contoh SRS)",
    totalAugA === 1_000_000,
    String(totalAugA),
  );

  const summaryAugA = await getBudgetSummary(userA.id, aug);
  check(
    "sisa anggaran A Agustus = 1.000.000",
    summaryAugA.remaining === 1_000_000,
    String(summaryAugA.remaining),
  );

  const totalAugB = await getMonthlyExpenseTotal(userB.id, aug);
  check(
    "pengeluaran user B tidak masuk ke perhitungan A",
    totalAugB === 777_000 && totalAugA === 1_000_000,
    `A=${totalAugA} B=${totalAugB}`,
  );

  check(
    "transaksi bulan lain tidak dihitung (Juli = 0)",
    (await getMonthlyExpenseTotal(userA.id, { year: 2026, month: 7 })) === 0,
  );

  // --- 3. Set / ubah budget (FR-16) -----------------------------------
  await setBudget(userA.id, { year: 2026, month: 7, amount: 300_000 });
  const updatedJuly = await setBudget(userA.id, {
    year: 2026,
    month: 7,
    amount: 450_000,
  });
  const julyRows = await prisma.budget.count({
    where: { userId: userA.id, year: 2026, month: 7 },
  });
  check(
    "setBudget mengubah nominal (upsert, satu baris)",
    updatedJuly.amount === 450_000 && julyRows === 1,
    `amount=${updatedJuly.amount} rows=${julyRows}`,
  );

  // --- 4. Authorization budget antar pengguna (FR-20) -----------------
  const budgetAaug = await getBudget(userA.id, aug);
  const budgetBaug = await getBudget(userB.id, aug);
  check(
    "user A hanya melihat budget miliknya",
    budgetAaug?.amount === 2_000_000,
    String(budgetAaug?.amount),
  );
  check(
    "budget A dan B terpisah",
    budgetBaug?.amount === 5_000_000 &&
      budgetAaug?.amount !== budgetBaug?.amount,
  );

  let undefinedUserRejected = false;
  try {
    // @ts-expect-error sengaja menguji guard runtime
    await getBudget(undefined, aug);
  } catch {
    undefinedUserRejected = true;
  }
  check("getBudget dengan userId undefined ditolak", undefinedUserRejected);

  let zeroUserRejected = false;
  try {
    await setBudget(0, { year: 2026, month: 8, amount: 1 });
  } catch {
    zeroUserRejected = true;
  }
  check("setBudget dengan userId 0 ditolak", zeroUserRejected);

  // --- 5. Ringkasan tanpa budget --------------------------------------
  const noBudget = await getBudgetSummary(userA.id, { year: 2025, month: 1 });
  check(
    "tanpa budget: hasBudget false, budget & sisa nol",
    noBudget.hasBudget === false &&
      noBudget.budget === 0 &&
      noBudget.remaining === 0,
    JSON.stringify(noBudget),
  );

  // --- 6. Bentuk data yang dikirim ke UI ------------------------------
  const [someDto] = await getTransactions(userA.id, "all");
  if (someDto) {
    const wire = toWireTransaction(someDto, userA.id);
    check(
      "wire memakai user_id dari session & date ISO",
      wire.user_id === String(userA.id) &&
        typeof wire.id === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(wire.date),
      JSON.stringify(wire),
    );
  }

  // --- 7. Bersihkan data uji ------------------------------------------
  await deleteTransaction(userB.id, expenseB.id);
  for (const id of createdA) {
    await deleteTransaction(userA.id, id);
  }
  await prisma.budget.deleteMany({
    where: {
      OR: [
        { userId: userA.id, year: 2026, month: 8 },
        { userId: userA.id, year: 2026, month: 7 },
        { userId: userB.id, year: 2026, month: 8 },
      ],
    },
  });
  check(
    "data uji dibersihkan",
    (await getMonthlyExpenseTotal(userA.id, aug)) === 0 &&
      (await getBudget(userA.id, aug)) === null,
  );
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
