/**
 * =====================================================================
 * INTEGRATION POINT — dibaca Anggota 1 (auth) & Anggota 2 (transaksi)
 * =====================================================================
 * File ini berisi ASUMSI struktur endpoint backend yang dipakai oleh
 * modul dashboard. Kalau endpoint asli sudah final, cukup ubah nilai
 * di bawah (atau logika di `session.ts` / `transactions.ts`) — sisa
 * komponen dashboard tidak perlu diubah.
 *
 * Asumsi kontrak API:
 * - GET /api/auth/session  -> 200 { user: { id, name, email } }
 *                              401 { message } bila belum login
 * - GET /api/transactions?user_id=<id>
 *                          -> 200 { data: Transaction[] }
 */

export const dashboardApiConfig = {
  /** Milik Anggota 1. Ganti path-nya di sini kalau endpoint session berbeda. */
  sessionEndpoint: "/api/auth/session",
  /**
   * Milik Anggota 2. Ganti path / bentuk query di sini kalau berbeda,
   * mis. "/api/transactions?userId=" atau "/api/users/<id>/transactions".
   * Lihat `buildTransactionsUrl()` di `transactions.ts`.
   */
  transactionsEndpoint: "/api/transactions",
} as const;

/**
 * MOCK SEMENTARA untuk development — boleh dihapus setelah backend asli ada.
 *
 * Selama Anggota 1 & 2 belum menyediakan endpoint di atas, modul dashboard
 * memakai data mock di `mock.ts` supaya halaman bisa didemo. Cara mematikan:
 * set `USE_DASHBOARD_MOCK = false`. Setelah itu kegagalan fetch akan
 * menampilkan error state + tombol retry (lihat `DashboardContent`).
 */
export const USE_DASHBOARD_MOCK = true;
