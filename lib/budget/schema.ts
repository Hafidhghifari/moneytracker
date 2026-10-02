import { z } from "zod";

/**
 * Kontrak input Monthly Budget (FR-16 Set Budget). Aman diimpor dari
 * client component karena tidak menyentuh Prisma Client.
 */
export const budgetInputSchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(1970, "Tahun tidak valid")
    .max(9999, "Tahun tidak valid"),
  month: z.coerce
    .number()
    .int()
    .min(1, "Bulan tidak valid")
    .max(12, "Bulan tidak valid"),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Nominal tidak valid")
    .transform(Number)
    .refine((value) => value > 0, "Nominal harus lebih dari 0")
    .refine((value) => value <= 9_999_999_999.99, "Nominal terlalu besar"),
});

export type BudgetInput = z.infer<typeof budgetInputSchema>;

export type BudgetPeriod = {
  year: number;
  month: number;
};

export const budgetPeriodSchema = budgetInputSchema.pick({
  year: true,
  month: true,
});

export function currentBudgetPeriod(now = new Date()): BudgetPeriod {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/* ------------------------------------------------------------------ */
/* Tambahan Anggota 3: pemilihan bulan (`YYYY-MM`) & kontrak ringkasan */
/* ------------------------------------------------------------------ */

/** `YYYY-MM` dengan bulan 2 digit (01–12). */
export const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format bulan tidak valid");

/** `"2026-01"` → `{ year: 2026, month: 1 }`; null bila format salah. */
export function parseMonth(value: string): BudgetPeriod | null {
  if (!monthSchema.safeParse(value).success) return null;
  const [year, month] = value.split("-").map(Number);
  return { year, month };
}

/** `{ year: 2026, month: 1 }` → `"2026-01"`. */
export function toMonthKey(period: BudgetPeriod): string {
  return `${period.year}-${String(period.month).padStart(2, "0")}`;
}

/** Kontrak respons `GET /api/budget?month=YYYY-MM` untuk UI budget. */
export type BudgetSummaryDTO = {
  month: string;
  hasBudget: boolean;
  budgetAmount: number;
  totalExpense: number;
  remaining: number;
  percentage: number | null;
};

export const upsertBudgetSchema = z.object({
  month: monthSchema,
  amount: z.coerce
    .number()
    .positive("Nominal anggaran harus lebih dari 0")
    .refine((value) => value <= 9_999_999_999.99, "Nominal terlalu besar"),
});

export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>;
