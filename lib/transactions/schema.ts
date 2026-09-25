import { z } from "zod";

export const TRANSACTION_TYPES = ["income", "expense"] as const;
export const TRANSACTION_FILTERS = ["all", "income", "expense"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type TransactionFilter = (typeof TRANSACTION_FILTERS)[number];

export type TransactionInput = {
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
};

export const transactionInputSchema = z.object({
  type: z
    .string()
    .refine(
      (value): value is TransactionType =>
        (TRANSACTION_TYPES as readonly string[]).includes(value),
      "Jenis transaksi tidak valid",
    ),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Nominal tidak valid")
    .transform(Number)
    .refine((value) => value > 0, "Nominal harus lebih dari 0")
    .refine((value) => value <= 9_999_999_999.99, "Nominal terlalu besar"),
  description: z
    .string()
    .trim()
    .min(1, "Deskripsi wajib diisi")
    .max(255, "Deskripsi maksimal 255 karakter"),
  transactionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
    .refine((value) => {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));

      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      );
    }, "Tanggal tidak valid"),
});

export const deleteTransactionSchema = z.object({
  transactionId: z.coerce.number().int().positive("Transaksi tidak valid"),
});

export const transactionFilterSchema = z
  .enum(TRANSACTION_FILTERS)
  .catch("all");
