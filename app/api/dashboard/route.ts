import { getCurrentUser } from "@/lib/auth/session";
import {
  calculateSummary,
  filterByPeriod,
  sortNewestFirst,
} from "@/lib/dashboard/summary";
import { getTransactionsByUserId } from "@/lib/dashboard/transactions-server";
import type { Period } from "@/lib/dashboard/types";

const RECENT_LIMIT = 5;

/**
 * Endpoint JSON dashboard (FR-12, milik Anggota 1).
 *
 * GET /api/dashboard[?year=YYYY&month=M] -> 200
 * {
 *   user: { id, name },
 *   period: { year, month } | null,   // null = semua periode
 *   summary: { totalIncome, totalExpense, balance },
 *   recent: Transaction[],            // 5 terbaru (pada periode bila difilter)
 *   transactions: Transaction[],     // sumber kebenaran untuk filter lokal
 * }
 *
 * - User selalu dari session login, BUKAN dari parameter request (FR-05).
 * - Tanpa year&month: seluruh transaksi user (dipakai refreshDashboard agar
 *   navigasi periode lokal tetap instan). Dengan keduanya: hanya bulan itu.
 * - Agregasi memakai fungsi murni yang sama dengan render server
 *   (lib/dashboard/summary.ts) sehingga angka identik dengan FR-06.
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
  const parsed = parsePeriod(searchParams);
  if (!parsed.ok) {
    return Response.json(
      { message: "Parameter bulan (1-12) atau tahun tidak valid." },
      { status: 400 },
    );
  }
  const period = parsed.period;

  try {
    const all = await getTransactionsByUserId(user.id);
    const scoped = period
      ? sortNewestFirst(filterByPeriod(all, period))
      : sortNewestFirst(all);
    const summary = calculateSummary(scoped);

    return Response.json({
      user: { id: user.id, name: user.name },
      period,
      summary: {
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        balance: summary.balance,
      },
      recent: scoped.slice(0, RECENT_LIMIT),
      transactions: all,
    });
  } catch {
    return Response.json(
      { message: "Data dashboard belum dapat dimuat. Coba lagi." },
      { status: 500 },
    );
  }
}

/**
 * year&month opsional; bila salah satu diisi, keduanya wajib valid.
 * `{ ok: true, period }` — period null berarti seluruh periode.
 * `{ ok: false }` — parameter tidak valid (dibalas 400).
 */
function parsePeriod(
  searchParams: URLSearchParams,
): { ok: true; period: Period | null } | { ok: false } {
  const rawYear = searchParams.get("year");
  const rawMonth = searchParams.get("month");
  if (rawYear === null && rawMonth === null) {
    return { ok: true, period: null };
  }
  const year = Number(rawYear);
  const month = Number(rawMonth);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return { ok: false };
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { ok: false };
  }
  return { ok: true, period: { year, month } };
}
