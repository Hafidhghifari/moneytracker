import type { Period } from "@/lib/dashboard/types";

/**
 * Akses AJAX Budget Summary (FR-17, milik Anggota 1).
 *
 * File ini dipakai Client Component — JANGAN import `next/headers` di sini.
 * User tidak dikirim dari client; endpoint mengambilnya dari session.
 */

export const BUDGET_SUMMARY_ENDPOINT = "/api/budget/summary";

export interface BudgetSummaryPayload {
  period: Period;
  /** null = budget bulan ini belum ditentukan. */
  budget: number | null;
  total_expense: number;
  remaining: number;
}

export function budgetSummaryUrl(period: Period): string {
  const params = new URLSearchParams({
    month: String(period.month),
    year: String(period.year),
  });
  return `${BUDGET_SUMMARY_ENDPOINT}?${params.toString()}`;
}

function toFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function ensurePayload(json: unknown): BudgetSummaryPayload {
  if (typeof json !== "object" || json === null) {
    throw new Error("Format ringkasan budget tidak valid.");
  }
  const data = json as Record<string, unknown>;
  const period = data.period as Period | undefined;
  if (
    !period ||
    !Number.isInteger(period.year) ||
    !Number.isInteger(period.month)
  ) {
    throw new Error("Format ringkasan budget tidak valid.");
  }
  const rawBudget = data.budget;
  let budget: number | null;
  if (rawBudget === null) {
    budget = null;
  } else {
    const parsed = toFiniteNumber(rawBudget);
    if (parsed === null) {
      throw new Error("Format ringkasan budget tidak valid.");
    }
    budget = parsed;
  }
  const totalExpense = toFiniteNumber(data.total_expense);
  const remaining = toFiniteNumber(data.remaining);
  if (totalExpense === null || remaining === null) {
    throw new Error("Format ringkasan budget tidak valid.");
  }
  return {
    period,
    budget,
    total_expense: totalExpense,
    remaining,
  };
}

/**
 * Ambil ringkasan budget bulan/tahun lewat AJAX. `onUnauthorized`
 * dipanggil bila server menjawab 401 (sesi berakhir).
 */
export async function fetchBudgetSummary(
  period: Period,
  onUnauthorized?: () => void,
): Promise<BudgetSummaryPayload> {
  const res = await fetch(budgetSummaryUrl(period), { cache: "no-store" });
  if (res.status === 401) {
    onUnauthorized?.();
    throw new Error("Sesi berakhir. Masuk kembali untuk melanjutkan.");
  }
  const json = (await res.json()) as { message?: unknown } & Record<
    string,
    unknown
  >;
  if (!res.ok) {
    throw new Error(
      typeof json.message === "string"
        ? json.message
        : `Gagal mengambil ringkasan budget (status ${res.status}).`,
    );
  }
  return ensurePayload(json);
}
