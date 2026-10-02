import { z } from "zod";

/** `YYYY-MM` dengan bulan 2 digit (01–12). */
export const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format bulan tidak valid");

export type MonthParts = { year: number; month: number };

/** `2026-01` → `{ year: 2026, month: 1 }`; null bila format salah. */
export function parseMonth(value: string): MonthParts | null {
  if (!monthSchema.safeParse(value).success) return null;
  const [year, month] = value.split("-").map(Number);
  return { year, month };
}

/** `{ year: 2026, month: 1 }` → `"2026-01"`. */
export function toMonthKey(parts: MonthParts): string {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}`;
}

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
