/**
 * Tipe data bersama untuk bagian "Dashboard & Financial Summary" (Moneyhist).
 *
 * Kontrak ini disepakati sebagai asumsi agar mudah disambungkan ke
 * endpoint asli Anggota 1 (auth/session) dan Anggota 2 (transaksi).
 */

export type TransactionType = "income" | "expense";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  /** "income" = pemasukan, "expense" = pengeluaran */
  type: TransactionType;
  description: string;
  /** Nominal dalam Rupiah (bilangan bulat, tanpa desimal). */
  amount: number;
  /** ISO date string, mis. "2026-09-24". */
  date: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  /** Saldo = Total Pemasukan - Total Pengeluaran */
  balance: number;
}
