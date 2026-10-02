/**
 * Penyimpanan budget minimal yang terisolasi (FR-17, milik Anggota 1).
 *
 * Belum ada tabel budget di database, dan form Set Budget adalah bagian
 * Anggota 4 — jadi modul ini HANYA menyimpan sementara di memori proses
 * (hilang saat restart), mengikuti pola `memoryStore` pada stub
 * `app/api/transactions`.
 *
 * ------------------------------------------------------------------
 * // TODO: sinkronkan dengan Anggota 4 — ganti isi modul ini dengan
 * tabel `budgets` (user_id, month, year, amount, unique pada
 * user_id+month+year) begitu form Set Budget + migration siap.
 * Kontrak `getBudget`/`setBudget` di bawah usahakan tetap agar
 * endpoint + UI tidak perlu berubah.
 * ------------------------------------------------------------------
 *
 * Modul server-only: JANGAN diimpor dari Client Component.
 */

type BudgetKey = `${string}:${number}:${number}`;

const budgets = new Map<BudgetKey, number>();

function budgetKey(userId: string, year: number, month: number): BudgetKey {
  return `${userId}:${year}:${month}`;
}

/** Ambil budget user pada bulan/tahun; null bila belum ditentukan. */
export function getBudget(
  userId: string,
  year: number,
  month: number,
): number | null {
  if (!userId) throw new Error("userId tidak valid.");
  return budgets.get(budgetKey(userId, year, month)) ?? null;
}

/**
 * Simpan/ubah budget user pada bulan/tahun. Disediakan untuk form
 * Set Budget (Anggota 4). Nominal Rupiah bilangan bulat >= 0.
 */
export function setBudget(
  userId: string,
  year: number,
  month: number,
  amount: number,
): number {
  if (!userId) throw new Error("userId tidak valid.");
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Nominal budget tidak valid.");
  }
  const rounded = Math.floor(amount);
  budgets.set(budgetKey(userId, year, month), rounded);
  return rounded;
}
