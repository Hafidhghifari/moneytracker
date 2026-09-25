import type {
  FinancialSummary,
  Transaction,
} from "@/lib/dashboard/types";

/**
 * Menghitung ringkasan keuangan dari daftar transaksi milik user.
 * Rumus: Saldo = Total Pemasukan - Total Pengeluaran.
 *
 * Fungsi murni (pure) — mudah di-unit-test dan dipakai ulang di
 * halaman lain tanpa bergantung pada fetch/session.
 */
export function calculateFinancialSummary(
  transactions: Transaction[]
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

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

/**
 * Mengambil N transaksi terbaru, diurutkan dari yang paling baru
 * berdasarkan tanggal (lalu id sebagai penyeimbang yang stabil).
 */
export function getRecentTransactions(
  transactions: Transaction[],
  limit = 5
): Transaction[] {
  return [...transactions]
    .sort((a, b) => {
      const dateDiff =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id.localeCompare(a.id);
    })
    .slice(0, limit);
}

/** Format angka ke Rupiah yang mudah dibaca, mis. Rp1.500.000 (NFR-02). */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format tanggal ISO ke tampilan Indonesia, mis. "24 Sep 2026". */
export function formatTransactionDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
