import type { SessionUser, Transaction } from "@/lib/dashboard/types";

/**
 * MOCK SEMENTARA — hapus / abaikan setelah backend asli tersedia.
 *
 * Data contoh milik satu user demo (mahasiswa). Semua transaksi memakai
 * `user_id` yang sama dengan `MOCK_USER.id`, jadi tidak ada hardcode
 * user_id di komponen — filter selalu mengikuti user yang login.
 */
export const MOCK_USER: SessionUser = {
  id: "user-mhs-001",
  name: "Mahasiswa Demo",
  email: "mahasiswa@moneyhist.id",
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "trx-08",
    user_id: "user-mhs-001",
    type: "expense",
    description: "Bayar kos bulan September",
    amount: 800000,
    date: "2026-09-24",
  },
  {
    id: "trx-07",
    user_id: "user-mhs-001",
    type: "income",
    description: "Gaji asisten lab",
    amount: 1200000,
    date: "2026-09-20",
  },
  {
    id: "trx-06",
    user_id: "user-mhs-001",
    type: "expense",
    description: "Belanja bulanan",
    amount: 350000,
    date: "2026-09-18",
  },
  {
    id: "trx-05",
    user_id: "user-mhs-001",
    type: "expense",
    description: "Fotokopi & print tugas",
    amount: 45000,
    date: "2026-09-15",
  },
  {
    id: "trx-04",
    user_id: "user-mhs-001",
    type: "expense",
    description: "Makan di kantin kampus",
    amount: 60000,
    date: "2026-09-12",
  },
  {
    id: "trx-03",
    user_id: "user-mhs-001",
    type: "income",
    description: "Uang saku bulanan",
    amount: 1500000,
    date: "2026-09-05",
  },
  {
    id: "trx-02",
    user_id: "user-mhs-001",
    type: "expense",
    description: "Bensin motor",
    amount: 50000,
    date: "2026-09-03",
  },
  {
    id: "trx-01",
    user_id: "user-mhs-001",
    type: "expense",
    description: "Kuota internet",
    amount: 75000,
    date: "2026-09-01",
  },
];
