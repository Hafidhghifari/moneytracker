import type {
  NewTransaction,
  Transaction,
} from "@/lib/dashboard/types";

/**
 * Akses data transaksi milik user yang login (FR-05 Authorization).
 * Selalu dipanggil dengan `user.id` dari session — tidak ada hardcode.
 *
 * File ini dipakai Client Component (`DashboardClient`) — JANGAN import
 * `next/headers` di sini. Fetch server-side ada di
 * `transactions-server.ts`.
 *
 * ------------------------------------------------------------------
 * TODO (Anggota 2): bila kontrak endpoint final berbeda (mis. path
 * param `/api/users/<id>/transactions` atau nama query lain), cukup
 * ubah `TRANSACTIONS_ENDPOINT` / fungsi di file ini. Bentuk respons:
 * `200 { data: Transaction[] }`.
 * ------------------------------------------------------------------
 */
export const TRANSACTIONS_ENDPOINT = "/api/transactions";

export function transactionsUrl(userId: string): string {
  const params = new URLSearchParams({ user_id: userId });
  return `${TRANSACTIONS_ENDPOINT}?${params.toString()}`;
}

function ensureValidUserId(userId: string): void {
  if (!userId) throw new Error("user_id tidak valid.");
}

function filterOwn(transactions: unknown, userId: string): Transaction[] {
  if (!Array.isArray(transactions)) {
    throw new Error("Format data transaksi tidak valid.");
  }
  return (transactions as Transaction[]).filter(
    (trx) => trx && trx.user_id === userId,
  );
}

/**
 * Fetch client-side (dipakai setelah tambah transaksi agar UI ter-update
 * tanpa reload). `onUnauthorized` dipanggil bila server menjawab 401
 * (session berakhir — DESIGN.md "Session berakhir").
 */
export async function fetchTransactionsClient(
  userId: string,
  onUnauthorized?: () => void,
): Promise<Transaction[]> {
  ensureValidUserId(userId);

  const res = await fetch(transactionsUrl(userId), { cache: "no-store" });
  if (res.status === 401) {
    onUnauthorized?.();
    throw new Error("Sesi berakhir. Masuk kembali untuk melanjutkan.");
  }
  if (!res.ok) {
    throw new Error(`Gagal mengambil transaksi (status ${res.status}).`);
  }
  const json = (await res.json()) as { data?: unknown };
  return filterOwn(json.data, userId);
}

/**
 * Simpan transaksi baru ke akun user yang login (FR-07). `userId` wajib
 * dari session; server wajib menolak `user_id` milik user lain (FR-05).
 */
export async function createTransaction(
  userId: string,
  input: NewTransaction,
): Promise<Transaction> {
  ensureValidUserId(userId);

  const res = await fetch(TRANSACTIONS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, user_id: userId }),
  });
  if (res.status === 401) {
    throw new Error("Sesi berakhir. Masuk kembali untuk melanjutkan.");
  }
  const json = (await res.json()) as {
    data?: Transaction;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(json.message ?? "Gagal menyimpan transaksi.");
  }
  if (!json.data || json.data.user_id !== userId) {
    throw new Error("Respons server tidak valid.");
  }
  return json.data;
}
