import type {
  FinancialSummary,
  Period,
  Transaction,
} from "@/lib/dashboard/types";

/**
 * Akses AJAX data dashboard (FR-12, milik Anggota 1).
 *
 * File ini dipakai Client Component — JANGAN import `next/headers` di sini.
 * Berbeda dengan `fetchTransactionsClient` (yang memakai `?user_id=` milik
 * stub Anggota 3), endpoint `/api/dashboard` mengambil user dari session,
 * sehingga tidak ada user id yang dikirim dari client (FR-05).
 */

/** Event yang memicu refresh dashboard dari kode mana pun. Kontrak untuk
 * Anggota 2: setelah tambah/hapus transaksi, cukup
 * `window.dispatchEvent(new Event(DASHBOARD_REFRESH_EVENT))` — tanpa
 * mengubah kode dashboard. */
export const DASHBOARD_REFRESH_EVENT = "moneyhist:transactions-changed";

export const DASHBOARD_ENDPOINT = "/api/dashboard";

export interface DashboardUser {
  id: string;
  name: string;
}

export interface DashboardPayload {
  user: DashboardUser;
  period: Period | null;
  summary: FinancialSummary;
  recent: Transaction[];
  transactions: Transaction[];
}

function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== "object" || value === null) return false;
  const trx = value as Record<string, unknown>;
  return (
    typeof trx.id === "string" &&
    typeof trx.user_id === "string" &&
    (trx.type === "income" || trx.type === "expense") &&
    typeof trx.amount === "number" &&
    Number.isFinite(trx.amount) &&
    typeof trx.description === "string" &&
    typeof trx.date === "string"
  );
}

function ensurePayload(json: unknown): DashboardPayload {
  if (typeof json !== "object" || json === null) {
    throw new Error("Format data dashboard tidak valid.");
  }
  const data = json as Record<string, unknown>;
  const user = data.user as { id?: unknown; name?: unknown } | undefined;
  if (!user || typeof user.id !== "string" || typeof user.name !== "string") {
    throw new Error("Format data dashboard tidak valid.");
  }
  if (!Array.isArray(data.transactions) || !data.transactions.every(isTransaction)) {
    throw new Error("Format data dashboard tidak valid.");
  }
  if (!Array.isArray(data.recent) || !data.recent.every(isTransaction)) {
    throw new Error("Format data dashboard tidak valid.");
  }
  const summary = data.summary as FinancialSummary | undefined;
  if (
    !summary ||
    typeof summary.totalIncome !== "number" ||
    typeof summary.totalExpense !== "number" ||
    typeof summary.balance !== "number"
  ) {
    throw new Error("Format data dashboard tidak valid.");
  }
  const period = data.period as Period | null | undefined;
  if (
    period !== null &&
    period !== undefined &&
    (typeof period !== "object" ||
      typeof (period as Period).year !== "number" ||
      typeof (period as Period).month !== "number")
  ) {
    throw new Error("Format data dashboard tidak valid.");
  }
  return {
    user: { id: user.id, name: user.name },
    period: period ?? null,
    summary,
    recent: data.recent as Transaction[],
    transactions: data.transactions as Transaction[],
  };
}

/**
 * Ambil data dashboard lewat AJAX. `onUnauthorized` dipanggil bila server
 * menjawab 401 (sesi berakhir) sehingga pemanggil bisa redirect ke login.
 */
export async function fetchDashboardData(
  onUnauthorized?: () => void,
): Promise<DashboardPayload> {
  const res = await fetch(DASHBOARD_ENDPOINT, { cache: "no-store" });
  if (res.status === 401) {
    onUnauthorized?.();
    throw new Error("Sesi berakhir. Masuk kembali untuk melanjutkan.");
  }
  const json = (await res.json()) as { message?: string } & Record<
    string,
    unknown
  >;
  if (!res.ok) {
    throw new Error(
      typeof json.message === "string"
        ? json.message
        : `Gagal mengambil dashboard (status ${res.status}).`,
    );
  }
  return ensurePayload(json);
}
