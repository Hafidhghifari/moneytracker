import { dashboardApiConfig, USE_DASHBOARD_MOCK } from "@/lib/dashboard/config";
import { MOCK_TRANSACTIONS } from "@/lib/dashboard/mock";
import type { Transaction } from "@/lib/dashboard/types";

/**
 * Menyusun URL endpoint transaksi milik Anggota 2.
 *
 * ------------------------------------------------------------------
 * INTEGRATION POINT (milik Anggota 2 — backend/database transaksi):
 * - Asumsi saat ini: GET /api/transactions?user_id=<id>.
 * - Kalau kontrak final berbeda (mis. path param atau nama query lain),
 *   cukup ubah fungsi ini. Bentuk respons yang diharapkan:
 *   200 { data: Transaction[] } dengan item { id, user_id, type,
 *   description, amount, date }.
 * ------------------------------------------------------------------
 */
export function buildTransactionsUrl(userId: string): string {
  const params = new URLSearchParams({ user_id: userId });
  return `${dashboardApiConfig.transactionsEndpoint}?${params.toString()}`;
}

/**
 * Mengambil seluruh transaksi milik seorang user berdasarkan user_id.
 *
 * Dipanggil dengan `user.id` dari session (lihat `session.ts`) — jangan
 * pernah memanggil fungsi ini dengan id yang di-hardcode di komponen.
 */
export async function getTransactionsByUserId(
  userId: string
): Promise<Transaction[]> {
  if (!userId) {
    throw new Error("user_id tidak valid.");
  }

  // Simulasi latency agar skeleton/loading state terlihat saat demo.
  // Hapus baris ini setelah memakai backend asli.
  if (USE_DASHBOARD_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  try {
    const res = await fetch(buildTransactionsUrl(userId), {
      cache: "no-store",
    });

    // Endpoint Anggota 2 belum ada (404): fallback ke mock selama
    // masa integrasi supaya halaman tetap bisa didemo.
    if (res.status === 404 && USE_DASHBOARD_MOCK) {
      return MOCK_TRANSACTIONS.filter((trx) => trx.user_id === userId);
    }
    if (!res.ok) {
      throw new Error(`Gagal mengambil transaksi (status ${res.status}).`);
    }

    const json = (await res.json()) as { data?: unknown };
    if (!Array.isArray(json.data)) {
      throw new Error("Format data transaksi tidak valid.");
    }
    // Hanya transaksi milik user yang login (pertahanan lapis kedua
    // kalau backend mengembalikan data user lain).
    return (json.data as Transaction[]).filter(
      (trx) => trx && trx.user_id === userId
    );
  } catch (error) {
    if (USE_DASHBOARD_MOCK && error instanceof TypeError) {
      // Fetch gagal total (backend belum jalan): pakai mock.
      return MOCK_TRANSACTIONS.filter((trx) => trx.user_id === userId);
    }
    throw error instanceof Error
      ? error
      : new Error("Gagal mengambil data transaksi.");
  }
}
