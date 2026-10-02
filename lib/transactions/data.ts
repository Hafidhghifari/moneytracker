import { prisma } from "../db";
import type { TransactionType as PrismaTransactionType } from "../generated/prisma/client";
import type {
  TransactionFilter,
  TransactionInput,
  TransactionType,
} from "./schema";

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

export type TransactionCounts = {
  all: number;
  income: number;
  expense: number;
};

/** Jumlah transaksi per jenis untuk user (badge filter AJAX). */
export async function getTransactionCounts(
  userId: number,
): Promise<TransactionCounts> {
  assertUserId(userId);

  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId },
    _count: { _all: true },
  });

  const counts: TransactionCounts = { all: 0, income: 0, expense: 0 };

  for (const group of grouped) {
    const key = TRANSACTION_TYPE_BY_PRISMA[group.type];
    counts[key] = group._count._all;
    counts.all += group._count._all;
  }

  return counts;
}

/**
 * Total pengeluaran user pada satu bulan kalender (UTC).
 * Batas: `>= awal bulan` dan `< awal bulan berikutnya`.
 */
export async function getExpenseTotalForMonth(
  userId: number,
  year: number,
  month: number,
): Promise<number> {
  assertUserId(userId);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Bulan tidak valid");
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "expense",
      transactionDate: { gte: start, lt: end },
    },
    _sum: { amount: true },
  });

  return Number(result._sum.amount?.toString() ?? "0");
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

export type TransactionSummary = {
  income: number;
  expense: number;
  balance: number;
};

export async function getSummary(userId: number): Promise<TransactionSummary> {
  assertUserId(userId);

  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId },
    _sum: { amount: true },
  });

  let income = 0;
  let expense = 0;

  for (const group of grouped) {
    const total = Number(group._sum.amount?.toString() ?? "0");
    if (group.type === "income") {
      income = total;
    } else {
      expense = total;
    }
  }

  return { income, expense, balance: income - expense };
}

export async function createTransaction(
  userId: number,
  input: TransactionInput,
): Promise<TransactionDTO> {
  assertUserId(userId);

  const row = await prisma.transaction.create({
    data: {
      userId,
      type: input.type,
      amount: input.amount.toFixed(2),
      description: input.description,
      transactionDate: toTransactionDate(input.transactionDate),
    },
  });

  return toDTO(row);
}

export async function deleteTransaction(
  userId: number,
  transactionId: number,
): Promise<boolean> {
  assertUserId(userId);

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    return false;
  }

  const result = await prisma.transaction.deleteMany({
    where: { id: transactionId, userId },
  });

  return result.count === 1;
}
