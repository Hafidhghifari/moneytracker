import { getTransactions } from "@/lib/transactions/data";
import { toWireTransaction } from "@/lib/transactions/wire";
import type { Transaction } from "@/lib/dashboard/types";

/**
 * Ambil transaksi milik user yang login untuk Server Component dashboard.
 *
 * Memakai data layer langsung (`lib/transactions/data.ts`) alih-alih fetch
 * HTTP ke `/api/transactions`, karena `getCurrentUserId()` di route handler
 * membaca cookie session sedangkan fetch server-ke-server tidak meneruskan
 * cookie tersebut. Data tetap difilter `userId` sehingga hanya transaksi
 * milik pengguna yang dikembalikan (FR-05, FR-20).
 */
export async function getTransactionsByUserId(
  userId: string,
): Promise<Transaction[]> {
  const id = Number(userId);
  if (!userId || !Number.isInteger(id) || id <= 0) {
    throw new Error("user_id tidak valid.");
  }

  const rows = await getTransactions(id, "all");
  return rows.map((row) => toWireTransaction(row, id));
}
