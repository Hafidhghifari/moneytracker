import type { Transaction } from "@/lib/dashboard/types";

/**
 * ------------------------------------------------------------------
 * TODO (Anggota 2 — database & backend transaksi): data sementara.
 * `buildMockTransactions(userId)` menempelkan `user_id` dari session
 * ke contoh transaksi agar halaman bisa didemo sebelum backend asli
 * ada — tanpa hardcode user_id di komponen mana pun. Hapus file ini
 * (dan pemakaiannya di route API) setelah endpoint/database asli jadi.
 * ------------------------------------------------------------------
 */
const SEED: Array<Omit<Transaction, "user_id">> = [
  {
    id: "trx-08",
    type: "expense",
    description: "Bayar kos bulan September",
    amount: 800000,
    date: "2026-09-24",
  },
  {
    id: "trx-07",
    type: "income",
    description: "Gaji asisten lab",
    amount: 1200000,
    date: "2026-09-20",
  },
  {
    id: "trx-06",
    type: "expense",
    description: "Belanja bulanan",
    amount: 350000,
    date: "2026-09-18",
  },
  {
    id: "trx-05",
    type: "expense",
    description: "Fotokopi dan print tugas",
    amount: 45000,
    date: "2026-09-15",
  },
  {
    id: "trx-04",
    type: "expense",
    description: "Makan di kantin kampus",
    amount: 60000,
    date: "2026-09-12",
  },
  {
    id: "trx-03",
    type: "income",
    description: "Uang saku bulanan",
    amount: 1500000,
    date: "2026-09-05",
  },
  {
    id: "trx-02",
    type: "expense",
    description: "Bensin motor",
    amount: 50000,
    date: "2026-09-03",
  },
  {
    id: "trx-01",
    type: "expense",
    description: "Kuota internet",
    amount: 75000,
    date: "2026-09-01",
  },
];

export function buildMockTransactions(userId: string): Transaction[] {
  return SEED.map((trx) => ({ ...trx, user_id: userId }));
}
