/**
 * Tipe data bersama "Dashboard & Financial Summary" (Moneyhist).
 * Kontrak mengikuti SRS §6.2 Tabel Transactions + FR-07.
 */

/** income = Pemasukan, expense = Pengeluaran (SRS BR-07/BR-08). */
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  /** Nominal Rupiah, bilangan bulat tanpa desimal. */
  amount: number;
  description: string;
  /** String tanggal ISO `YYYY-MM-DD` (kolom `transaction_date`). */
  date: string;
}

/** Saldo = Total Pemasukan − Total Pengeluaran (SRS FR-06, BR-06). */
export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

/** Periode bulan aktif untuk navigasi `< [Bulan Tahun] >`. */
export interface Period {
  year: number;
  month: number; // 1–12
}

/** Payload tambah transaksi — `user_id` selalu diisi dari session. */
export interface NewTransaction {
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
}
