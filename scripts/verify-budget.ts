import "dotenv/config";
import { prisma } from "../lib/db";
import { getBudgetSummary } from "../lib/budget/data";
import {
  monthSchema,
  parseMonth,
  toMonthKey,
  upsertBudgetSchema,
} from "../lib/budget/schema";
import {
  getExpenseTotalForMonth,
  getTransactionCounts,
  getTransactions,
} from "../lib/transactions/data";

// Pembacaan kolom @db.Date harus deterministik di mesin mana pun.
process.env.TZ = "UTC";

const TEST_YEAR = 2099; // angka jauh dari data seed (2026) agar tidak bentrok

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
  // --- 1. Validasi schema bulan -------------------------------------
  check("monthSchema menerima 2026-10", monthSchema.safeParse("2026-10").success);

  for (const bad of ["2026-13", "2026-00", "2026-1", "26-10", "", "2026/10"]) {
    check(`monthSchema menolak "${bad}"`, !monthSchema.safeParse(bad).success);
  }

  check(
    "parseMonth memecah 2026-10",
    JSON.stringify(parseMonth("2026-10")) === JSON.stringify({ year: 2026, month: 10 }),
  );
  check("parseMonth menolak input salah", parseMonth("2026-13") === null);
  check(
    "toMonthKey memberi bulan 2 digit",
    toMonthKey({ year: 2026, month: 1 }) === "2026-01",
  );

  // --- 2. Validasi input Set Budget ---------------------------------
  const upsertOk = upsertBudgetSchema.safeParse({
    month: "2026-10",
    amount: 2000000,
  });
  check(
    "upsertBudgetSchema menerima nominal valid",
    upsertOk.success && upsertOk.data.amount === 2000000,
  );

  for (const amount of [0, -5, Number.NaN]) {
    check(
      `upsertBudgetSchema menolak amount ${String(amount)}`,
      !upsertBudgetSchema.safeParse({ month: "2026-10", amount }).success,
    );
  }

  check(
    "upsertBudgetSchema menolak bulan salah",
    !upsertBudgetSchema.safeParse({ month: "2026-13", amount: 1000 }).success,
  );

  // --- 3. Fixture database ------------------------------------------
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
    check("seed tersedia untuk suite database", false, "jalankan pnpm db:seed");
    return;
  }

  const createdTransactionIds: number[] = [];

  try {
    const fixtures = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: userA.id,
          type: "expense",
          amount: "100000.00",
          description: "fixture budget Januari",
          transactionDate: new Date(Date.UTC(TEST_YEAR, 0, 15)),
        },
      }),
      prisma.transaction.create({
        data: {
          userId: userA.id,
          type: "expense",
          amount: "5000.00",
          description: "fixture Desember sebelumnya",
          transactionDate: new Date(Date.UTC(TEST_YEAR - 1, 11, 31)),
        },
      }),
      prisma.transaction.create({
        data: {
          userId: userA.id,
          type: "income",
          amount: "500000.00",
          description: "fixture income Januari",
          transactionDate: new Date(Date.UTC(TEST_YEAR, 0, 10)),
        },
      }),
      prisma.transaction.create({
        data: {
          userId: userA.id,
          type: "expense",
          amount: "7000.00",
          description: "fixture Februari",
          transactionDate: new Date(Date.UTC(TEST_YEAR, 1, 1)),
        },
      }),
      prisma.transaction.create({
        data: {
          userId: userB.id,
          type: "expense",
          amount: "999999.00",
          description: "fixture pengeluaran user B",
          transactionDate: new Date(Date.UTC(TEST_YEAR, 0, 20)),
        },
      }),
    ]);
    createdTransactionIds.push(...fixtures.map((row) => row.id));

    // --- 4. Filter + counts -----------------------------------------
    const allA = await getTransactions(userA.id, "all");
    const incomeA = await getTransactions(userA.id, "income");
    const expenseA = await getTransactions(userA.id, "expense");
    const countsA = await getTransactionCounts(userA.id);

    check(
      "counts.all = jumlah transaksi user A",
      countsA.all === allA.length,
      `${countsA.all} vs ${allA.length}`,
    );
    check(
      "counts.income = jumlah filter income",
      countsA.income === incomeA.length,
      `${countsA.income} vs ${incomeA.length}`,
    );
    check(
      "counts.expense = jumlah filter expense",
      countsA.expense === expenseA.length,
      `${countsA.expense} vs ${expenseA.length}`,
    );
    check(
      "filter income hanya mengembalikan income",
      incomeA.every((row) => row.type === "income"),
    );

    const idsB = new Set(
      (
        await prisma.transaction.findMany({
          where: { userId: userB.id },
          select: { id: true },
        })
      ).map((row) => row.id),
    );
    check(
      "hasil user A tidak memuat transaksi user B",
      allA.every((row) => !idsB.has(row.id)),
    );

    // --- 5. Batas bulan pada total pengeluaran -----------------------
    const expenseJan = await getExpenseTotalForMonth(userA.id, TEST_YEAR, 1);
    check(
      "getExpenseTotalForMonth menjumlah bulan terpilih",
      expenseJan === 100000,
      `dapat ${expenseJan}`,
    );
    const expenseDec = await getExpenseTotalForMonth(userA.id, TEST_YEAR - 1, 12);
    check(
      "batas bulan sebelumnya tidak masuk",
      expenseDec === 5000,
      `dapat ${expenseDec}`,
    );
    const expenseFeb = await getExpenseTotalForMonth(userA.id, TEST_YEAR, 2);
    check(
      "batas bulan berikutnya tidak masuk",
      expenseFeb === 7000,
      `dapat ${expenseFeb}`,
    );
    check(
      "pengeluaran user B tidak dihitung untuk user A",
      expenseJan === 100000,
    );

    // --- 6. Summary budget -------------------------------------------
    await prisma.budget.upsert({
      where: {
        userId_year_month: { userId: userA.id, year: TEST_YEAR, month: 1 },
      },
      create: {
        userId: userA.id,
        year: TEST_YEAR,
        month: 1,
        amount: "1000000.00",
      },
      update: { amount: "1000000.00" },
    });
    await prisma.budget.upsert({
      where: {
        userId_year_month: { userId: userA.id, year: TEST_YEAR, month: 5 },
      },
      create: { userId: userA.id, year: TEST_YEAR, month: 5, amount: "0.00" },
      update: { amount: "0.00" },
    });

    const beforeBudget = await getBudgetSummary(userA.id, TEST_YEAR, 3);
    check("bulan tanpa budget -> hasBudget false", beforeBudget.hasBudget === false);
    check("bulan tanpa budget -> totalExpense 0", beforeBudget.totalExpense === 0);
    check("bulan tanpa budget -> remaining 0", beforeBudget.remaining === 0);
    check("bulan tanpa budget -> percentage null", beforeBudget.percentage === null);

    const summaryJan = await getBudgetSummary(userA.id, TEST_YEAR, 1);
    check("summary -> month key 2 digit", summaryJan.month === "2099-01");
    check("summary -> hasBudget true", summaryJan.hasBudget === true);
    check("summary -> budgetAmount", summaryJan.budgetAmount === 1000000);
    check("summary -> totalExpense", summaryJan.totalExpense === 100000);
    check("summary -> remaining = anggaran - pengeluaran", summaryJan.remaining === 900000);
    check("summary -> percentage", summaryJan.percentage === 10);

    const zeroBudget = await getBudgetSummary(userA.id, TEST_YEAR, 5);
    check("anggaran 0 -> percentage null", zeroBudget.percentage === null);

    // --- 7. Idempotensi upsert ----------------------------------------
    await prisma.budget.upsert({
      where: {
        userId_year_month: { userId: userA.id, year: TEST_YEAR, month: 1 },
      },
      create: { userId: userA.id, year: TEST_YEAR, month: 1, amount: "1.00" },
      update: { amount: "2000000.00" },
    });
    const budgetRows = await prisma.budget.findMany({
      where: { userId: userA.id, year: TEST_YEAR, month: 1 },
    });
    check("upsert bulan sama tidak menduplikasi", budgetRows.length === 1);
    check(
      "upsert memperbarui nominal",
      Number(budgetRows[0]?.amount.toString() ?? "0") === 2000000,
    );
    const summaryUpdated = await getBudgetSummary(userA.id, TEST_YEAR, 1);
    check(
      "summary mengikuti perubahan nominal",
      summaryUpdated.budgetAmount === 2000000 && summaryUpdated.remaining === 1900000,
    );

    // --- 8. Isolasi per user ------------------------------------------
    const summaryB = await getBudgetSummary(userB.id, TEST_YEAR, 1);
    check(
      "budget user A tidak terlihat user B",
      summaryB.hasBudget === false && summaryB.budgetAmount === 0,
    );
    check(
      "pengeluaran user A tidak masuk summary user B",
      summaryB.totalExpense === 999999,
      `dapat ${summaryB.totalExpense}`,
    );
  } finally {
    if (createdTransactionIds.length > 0) {
      await prisma.transaction.deleteMany({
        where: { id: { in: createdTransactionIds } },
      });
    }
    await prisma.budget.deleteMany({
      where: { userId: { in: [userA.id, userB.id] }, year: TEST_YEAR },
    });
  }
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
