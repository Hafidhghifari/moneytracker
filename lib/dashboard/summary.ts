import type {
  FinancialSummary,
  Period,
  Transaction,
} from "@/lib/dashboard/types";

/**
 * Fungsi murni agregasi dashboard — tanpa fetch/session sehingga mudah
 * diuji dan dipakai ulang. Rumus mengikuti SRS FR-06 / BR-06 s.d. BR-08.
 */

/** Saldo = Total Pemasukan − Total Pengeluaran. */
export function calculateSummary(
  transactions: Transaction[],
): FinancialSummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const trx of transactions) {
    const amount = Number(trx.amount) || 0;
    if (trx.type === "income") {
      totalIncome += amount;
    } else if (trx.type === "expense") {
      totalExpense += amount;
    }
  }

  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

/** Saring transaksi ke bulan aktif (format tanggal `YYYY-MM-DD`). */
export function filterByPeriod(
  transactions: Transaction[],
  period: Period,
): Transaction[] {
  const prefix = `${period.year}-${String(period.month).padStart(2, "0")}`;
  return transactions.filter((trx) => trx.date.startsWith(prefix));
}

/** Urutkan terbaru dulu; id sebagai penyeimbang yang stabil. */
export function sortNewestFirst(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.id.localeCompare(a.id);
  });
}

/** Geser periode satu bulan; menangani pergantian tahun. */
export function shiftPeriod(period: Period, delta: -1 | 1): Period {
  const date = new Date(period.year, period.month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

/** Periode bulan berjalan — state awal navigator periode. */
export function currentPeriod(): Period {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}
