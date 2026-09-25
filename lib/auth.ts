import { getCurrentUser } from "./auth/session";

/**
 * Ambil ID pengguna database dari session login yang telah diverifikasi.
 * Signature ini dipakai oleh server actions transaksi.
 */
export async function getCurrentUserId(): Promise<number | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const userId = Number(user.id);
  return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
}
