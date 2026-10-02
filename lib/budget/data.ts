import { prisma } from "../db";
import { getExpenseTotalForMonth } from "../transactions/data";
import { toMonthKey } from "./schema";
import type { BudgetSummaryDTO } from "./schema";

function assertUserId(userId: number): void {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("userId tidak valid");
  }
}

/**
 * Ringkasan budget user pada satu bulan.
 * FR-15/17/19/21: total pengeluaran hanya dari transaksi `expense`
 * milik user tersebut pada bulan terpilih.
 */
export async function getBudgetSummary(
  userId: number,
  year: number,
  month: number,
): Promise<BudgetSummaryDTO> {
  assertUserId(userId);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Bulan tidak valid");
  }

  const [budget, totalExpense] = await Promise.all([
    prisma.monthlyBudget.findUnique({
      where: { userId_year_month: { userId, year, month } },
      select: { amount: true },
    }),
    getExpenseTotalForMonth(userId, year, month),
  ]);

  const hasBudget = budget !== null;
  const budgetAmount = hasBudget ? Number(budget.amount.toString()) : 0;
  const remaining = hasBudget ? budgetAmount - totalExpense : 0;
  const percentage =
    hasBudget && budgetAmount > 0 ? (totalExpense / budgetAmount) * 100 : null;

  return {
    month: toMonthKey({ year, month }),
    hasBudget,
    budgetAmount,
    totalExpense,
    remaining,
    percentage,
  };
}
