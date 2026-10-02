import { getCurrentUser } from "@/lib/auth/session";
import { getMonthlyExpense } from "@/lib/budget/expenses";
import { getBudget } from "@/lib/budget/store";

/**
 * Endpoint JSON Budget Summary (FR-17, milik Anggota 1).
 *
 * GET /api/budget/summary?month=M&year=YYYY -> 200
 * {
 *   period: { year, month },
 *   budget: number | null,   // null = belum ditentukan bulan ini
 *   total_expense: number,    // hanya transaksi Pengeluaran milik user login
 *   remaining: number,        // budget - total_expense (0 bila budget null)
 * }
 *
 * - month wajib 1-12, year wajib tahun wajar; selain itu 400.
 * - User selalu dari session login; query selalu difilter user_id (FR-05).
 * - Tidak ada pembagian sehingga tidak mungkin divide-by-zero/NaN:
 *   semua angka dijamin finite sebelum dibalas.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      { message: "Sesi berakhir. Silakan masuk kembali." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return Response.json(
      { message: "Parameter month harus angka 1-12." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return Response.json(
      { message: "Parameter year tidak valid." },
      { status: 400 },
    );
  }

  try {
    const budget = getBudget(user.id, year, month);
    const totalExpense = await getMonthlyExpense(user.id, year, month);
    const safeExpense =
      Number.isFinite(totalExpense) && totalExpense > 0 ? totalExpense : 0;

    return Response.json({
      period: { year, month },
      budget,
      total_expense: safeExpense,
      remaining: (budget ?? 0) - safeExpense,
    });
  } catch {
    return Response.json(
      { message: "Ringkasan budget belum dapat dimuat. Coba lagi." },
      { status: 500 },
    );
  }
}
