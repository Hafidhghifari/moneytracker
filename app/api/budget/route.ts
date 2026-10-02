import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getBudgetSummary } from "@/lib/budget/data";
import { parseMonth } from "@/lib/budget/schema";

/**
 * GET /api/budget?month=YYYY-MM
 * FR-15/FR-19/FR-20: budget dihitung dari session user, bukan parameter client.
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
  const parsed = parseMonth(searchParams.get("month") ?? "");
  if (!parsed) {
    return NextResponse.json(
      { message: "Format bulan tidak valid." },
      { status: 400 },
    );
  }

  const data = await getBudgetSummary(userId, parsed.year, parsed.month);
  return NextResponse.json({ data });
}
