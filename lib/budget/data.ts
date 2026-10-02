import { prisma } from "../db";
import type { BudgetInput, BudgetPeriod } from "./schema";

export type BudgetDTO = {
  id: number;
  year: number;
  month: number;
  amount: number;
};

export type BudgetSummary = {
  year: number;
  month: number;
  /** True bila pengguna sudah menetapkan anggaran pada bulan tersebut. */
  hasBudget: boolean;
  budget: number;
  totalExpense: number;
  remaining: number;
};

// Kolom @db.Date dibaca/ditulis sebagai UTC agar deterministik di mesin mana pun.
function monthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  return { start, end };
}

function assertUserId(userId: number): void {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("userId tidak valid");
  }
}

function assertPeriod({ year, month }: BudgetPeriod): void {
  if (!Number.isInteger(year) || year < 1970 || year > 9999) {
    throw new Error("Tahun tidak valid");
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Bulan tidak valid");
  }
}

function toDTO(row: {
  id: number;
  year: number;
  month: number;
  amount: { toString(): string };
}): BudgetDTO {
  return {
    id: row.id,
    year: row.year,
    month: row.month,
    amount: Number(row.amount.toString()),
  };
}

/**
 * Anggaran milik pengguna pada bulan tertentu (FR-15, FR-20).
 * Selalu difilter `userId` — data milik pengguna lain tidak pernah terjangkau.
 */
export async function getBudget(
  userId: number,
  period: BudgetPeriod,
): Promise<BudgetDTO | null> {
  assertUserId(userId);
  assertPeriod(period);

  const row = await prisma.budget.findUnique({
    where: {
      userId_year_month: {
        userId,
        year: period.year,
        month: period.month,
      },
    },
  });

  return row ? toDTO(row) : null;
}

/**
 * Tetapkan/ubah anggaran pengguna untuk satu bulan (FR-16). Membuat baris
 * baru bila belum ada, memperbarui nominal bila sudah ada (upsert).
 */
export async function setBudget(
  userId: number,
  input: BudgetInput,
): Promise<BudgetDTO> {
  assertUserId(userId);
  assertPeriod(input);

  const row = await prisma.budget.upsert({
    where: {
      userId_year_month: {
        userId,
        year: input.year,
        month: input.month,
      },
    },
    create: {
      userId,
      year: input.year,
      month: input.month,
      amount: input.amount.toFixed(2),
    },
    update: {
      amount: input.amount.toFixed(2),
    },
  });

  return toDTO(row);
}

/**
 * Total transaksi pengeluaran pengguna pada bulan terpilih (FR-21).
 * Hanya transaksi `type = "expense"` milik `userId` dalam rentang bulan
 * yang dihitung; transaksi pemasukan dan milik pengguna lain diabaikan.
 */
export async function getMonthlyExpenseTotal(
  userId: number,
  period: BudgetPeriod,
): Promise<number> {
  assertUserId(userId);
  assertPeriod(period);

  const { start, end } = monthRange(period.year, period.month);

  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "expense",
      transactionDate: { gte: start, lt: end },
    },
    _sum: { amount: true },
  });

  return Number(result._sum.amount?.toString() ?? "0");
}

/**
 * Ringkasan anggaran bulanan (FR-17): anggaran, total pengeluaran, dan sisa
 * anggaran. `remaining = budget - totalExpense` (sesuai rumus SRS).
 */
export async function getBudgetSummary(
  userId: number,
  period: BudgetPeriod,
): Promise<BudgetSummary> {
  assertUserId(userId);
  assertPeriod(period);

  const [budget, totalExpense] = await Promise.all([
    getBudget(userId, period),
    getMonthlyExpenseTotal(userId, period),
  ]);

  const budgetAmount = budget?.amount ?? 0;

  return {
    year: period.year,
    month: period.month,
    hasBudget: budget !== null,
    budget: budgetAmount,
    totalExpense,
    remaining: budgetAmount - totalExpense,
  };
}
