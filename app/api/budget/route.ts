import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getBudgetSummary } from "@/lib/budget/data";
import { parseMonth, toMonthKey } from "@/lib/budget/schema";
import type { BudgetSummaryDTO } from "@/lib/budget/schema";

/**
 * GET /api/budget?month=YYYY-MM
 * FR-15/FR-19/FR-20: ringkasan dihitung dari session user, bukan parameter
 * client. Memakai data layer budget terintegrasi (FR-21) yang ada di main,
 * lalu dipetakan ke kontrak UI `BudgetSummaryDTO`.
 */
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { message: "Sesi berakhir, silakan masuk kembali." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const period = parseMonth(searchParams.get("month") ?? "");
  if (!period) {
    return NextResponse.json(
      { message: "Format bulan tidak valid." },
      { status: 400 },
    );
  }

  const summary = await getBudgetSummary(userId, period);
  const data: BudgetSummaryDTO = {
    month: toMonthKey(period),
    hasBudget: summary.hasBudget,
    budgetAmount: summary.budget,
    totalExpense: summary.totalExpense,
    remaining: summary.hasBudget ? summary.remaining : 0,
    percentage:
      summary.hasBudget && summary.budget > 0
        ? (summary.totalExpense / summary.budget) * 100
        : null,
  };

  return NextResponse.json({ data });
}
