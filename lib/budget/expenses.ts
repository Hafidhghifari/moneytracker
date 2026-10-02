import { getTransactionsByUserId } from "@/lib/dashboard/transactions-server";

/**
 * Total pengeluaran user pada bulan/tahun — versi minimal terisolasi
 * (FR-17, milik Anggota 1). Dihitung dari sumber data yang SAMA dengan
 * dashboard sehingga angkanya konsisten dengan Total Pengeluaran di
 * FinancialSummary.
 *
 * ------------------------------------------------------------------
 * // TODO: sinkronkan dengan Anggota 2 — ganti dengan query total
 * pengeluaran per user per bulan miliknya (mis. Prisma
 * `where: { userId, transactionDate: { gte, lt } , type: "expense" }`)
 * begitu backend transaksi final. Kontrak fungsi ini usahakan tetap.
 * ------------------------------------------------------------------
 *
 * Modul server-only: JANGAN diimpor dari Client Component.
 */
export async function getMonthlyExpense(
  userId: string,
  year: number,
  month: number,
): Promise<number> {
  if (!userId) throw new Error("userId tidak valid.");

  const transactions = await getTransactionsByUserId(userId);
  const prefix = `${year}-${String(month).padStart(2, "0")}`;

  let total = 0;
  for (const trx of transactions) {
    if (trx.type !== "expense") continue;
    if (!trx.date.startsWith(prefix)) continue;
    const amount = Number(trx.amount);
    if (Number.isFinite(amount) && amount > 0) total += amount;
  }
  return total;
}
