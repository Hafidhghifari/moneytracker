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
