/**
 * Format Rupiah & tanggal lokal Indonesia (DESIGN.md "Tipografi",
 * "Hero dashboard"). Selalu via Intl, bukan string rakitan manual.
 */

/** mis. 2450000 -> "Rp 2.450.000" */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** mis. "2026-09-24" -> "24 Sep 2026" */
export function formatTransactionDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** mis. { year: 2026, month: 9 } -> "September 2026" */
export function formatPeriod(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
  // Kapitalisasi kalimat (DESIGN.md "Tipografi").
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Nilai default `<input type="date">` hari ini: "YYYY-MM-DD". */
export function toInputDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
