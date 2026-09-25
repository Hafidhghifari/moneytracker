import { prisma } from "../db";
import type { TransactionType as PrismaTransactionType } from "../generated/prisma/client";
import type { TransactionFilter, TransactionType } from "./schema";

export type TransactionDTO = {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
};

type TransactionRow = {
  id: number;
  type: PrismaTransactionType;
  amount: { toString(): string };
  description: string;
  transactionDate: Date;
};

// Jembatan compile-time: gagal build bila daftar tipe di schema.ts dan enum
// Prisma tidak lagi sama. Wajib ada karena schema.ts sengaja tidak mengimpor
// Prisma Client agar aman dipakai di client component.
const TRANSACTION_TYPE_BY_PRISMA: Record<
  PrismaTransactionType,
  TransactionType
> = {
  income: "income",
  expense: "expense",
};

function assertUserId(userId: number): void {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("userId tidak valid");
  }
}

function toTransactionDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateString(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toDTO(row: TransactionRow): TransactionDTO {
  return {
    id: row.id,
    type: TRANSACTION_TYPE_BY_PRISMA[row.type],
    amount: Number(row.amount.toString()),
    description: row.description,
    transactionDate: toDateString(row.transactionDate),
  };
}

export async function getTransactions(
  userId: number,
  filter: TransactionFilter,
): Promise<TransactionDTO[]> {
  assertUserId(userId);

  const rows = await prisma.transaction.findMany({
    where: { userId, ...(filter !== "all" ? { type: filter } : {}) },
    orderBy: [{ transactionDate: "desc" }, { id: "desc" }],
  });

  return rows.map(toDTO);
}

export async function getRecentTransactions(
  userId: number,
  limit = 5,
): Promise<TransactionDTO[]> {
  assertUserId(userId);

  const rows = await prisma.transaction.findMany({
    where: { userId },
    orderBy: [{ transactionDate: "desc" }, { id: "desc" }],
    take: limit,
  });

  return rows.map(toDTO);
}
