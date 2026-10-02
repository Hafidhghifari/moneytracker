const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const integerFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return "Rp 0";
  return currencyFormatter.format(amount);
}

export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return integerFormatter.format(value);
}

export function formatDate(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "—";
  return dateFormatter.format(date);
}

export function sortableDate(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIso(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function digitsToNumber(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (!digits) return NaN;
  return Number(digits);
}

export function formatInputAmount(digits: string): string {
  const number = Number(digits);
  if (!Number.isFinite(number)) return digits;
  return integerFormatter.format(number);
}

function toDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}