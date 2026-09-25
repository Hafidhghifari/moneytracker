import { headers } from "next/headers";
import {
  transactionsUrl,
} from "@/lib/dashboard/transactions";
import type { Transaction } from "@/lib/dashboard/types";

/**
 * Fetch transaksi khusus Server Component (`app/dashboard/page.tsx`).
 * Dipisah dari `transactions.ts` karena modul ini memakai
 * `next/headers` yang tidak boleh masuk bundle Client Component.
 *
 * Fetch server-side wajib URL absolut (Node menolak path relatif),
 * jadi basis diambil dari header request aktif.
 */
export async function getTransactionsByUserId(
  userId: string,
): Promise<Transaction[]> {
  if (!userId) throw new Error("user_id tidak valid.");

  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  if (!host) {
    throw new Error("Gagal menentukan alamat server.");
  }

  const res = await fetch(`${proto}://${host}${transactionsUrl(userId)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal mengambil transaksi (status ${res.status}).`);
  }
  const json = (await res.json()) as { data?: unknown };
  if (!Array.isArray(json.data)) {
    throw new Error("Format data transaksi tidak valid.");
  }
  // Hanya transaksi milik user yang login (FR-05, lapis kedua).
  return (json.data as Transaction[]).filter(
    (trx) => trx && trx.user_id === userId,
  );
}
