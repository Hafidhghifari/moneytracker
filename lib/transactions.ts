export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  transaction_date: string;
}

export interface TransactionPayload {
  type: TransactionType;
  amount: number;
  description: string;
  transaction_date: string;
}

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
};

export class TransactionApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TransactionApiError";
    this.status = status;
  }
}

const API_BASE = "/api/transactions";

/**
 * Demo mode: hingga backend `/api/transactions` tersedia, UI memakai data
 * dummy agar fitur riwayat/filter/hapus/tambah bisa dipakai. Matikan dengan
 * env `NEXT_PUBLIC_TRANSACTIONS_MOCK=0`.
 */
const DEMO_MODE = process.env.NEXT_PUBLIC_TRANSACTIONS_MOCK !== "0";

let demoStore: Transaction[] = seedDemoData();

export function __resetDemo() {
  demoStore = seedDemoData();
}

export async function getTransactions(): Promise<Transaction[]> {
  if (DEMO_MODE) {
    await delay(350);
    return [...demoStore];
  }
  const data = await request<unknown>("/");
  if (Array.isArray(data)) {
    return normalizeTransactions(data);
  }
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.transactions)) {
      return normalizeTransactions(record.transactions);
    }
    if (Array.isArray(record.data)) {
      return normalizeTransactions(record.data);
    }
  }
  throw new TransactionApiError("Respons transaksi tidak sesuai format.", 0);
}

export async function createTransaction(
  payload: TransactionPayload
): Promise<Transaction> {
  if (DEMO_MODE) {
    await delay(450);
    const transaction: Transaction = {
      id: `demo-${Date.now()}`,
      type: payload.type,
      amount: payload.amount,
      description: payload.description,
      transaction_date: payload.transaction_date,
    };
    demoStore = [transaction, ...demoStore];
    return transaction;
  }
  return request<Transaction>("/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  if (DEMO_MODE) {
    await delay(400);
    demoStore = demoStore.filter((item) => item.id !== id);
    return;
  }
  await request<unknown>(`/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      headers,
      ...init,
    });
  } catch {
    throw new TransactionApiError(
      "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
      0
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message = extractErrorMessage(data) ?? fallbackMessage(response.status);
    throw new TransactionApiError(message, response.status);
  }

  return data as T;
}

export function messageOfError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Terjadi kesalahan. Silakan coba lagi.";
}

function extractErrorMessage(data: unknown): string | null {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["error", "message"]) {
      if (typeof record[key] === "string" && (record[key] as string).trim()) {
        return record[key] as string;
      }
    }
  }
  return null;
}

function fallbackMessage(status: number): string {
  switch (status) {
    case 400:
    case 422:
      return "Data transaksi tidak valid.";
    case 401:
      return "Sesi berakhir, silakan masuk kembali.";
    case 403:
      return "Anda tidak memiliki akses ke transaksi ini.";
    case 404:
      return "Transaksi tidak ditemukan.";
    default:
      return "Terjadi kesalahan pada server. Silakan coba lagi.";
  }
}

function normalizeTransactions(list: unknown[]): Transaction[] {
  return list.map((item) => {
    const raw = (item ?? {}) as Partial<Transaction>;
    const type: TransactionType =
      raw.type === "expense" ? "expense" : "income";
    return {
      id: String(raw.id ?? ""),
      type,
      amount: Number(raw.amount ?? 0),
      description: String(raw.description ?? ""),
      transaction_date: String(raw.transaction_date ?? ""),
    };
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function seedDemoData(): Transaction[] {
  return [
    { id: "demo-1", type: "income", amount: 1_500_000, description: "Uang saku bulanan", transaction_date: daysAgo(2) },
    { id: "demo-2", type: "expense", amount: 45_000, description: "Makan siang di kantin", transaction_date: daysAgo(3) },
    { id: "demo-3", type: "expense", amount: 150_000, description: "Isi ulang kuota internet", transaction_date: daysAgo(4) },
    { id: "demo-4", type: "expense", amount: 12_000, description: "Transit bus kampus", transaction_date: daysAgo(5) },
    { id: "demo-5", type: "expense", amount: 60_000, description: "Beli buku catatan", transaction_date: daysAgo(7) },
    { id: "demo-6", type: "income", amount: 800_000, description: "Gaji magang paruh waktu", transaction_date: daysAgo(9) },
    { id: "demo-7", type: "expense", amount: 120_000, description: "Nonton bareng teman", transaction_date: daysAgo(10) },
    { id: "demo-8", type: "expense", amount: 85_000, description: "Belanja kebutuhan mingguan", transaction_date: daysAgo(12) },
    { id: "demo-9", type: "income", amount: 250_000, description: "Hasil jualan preloved", transaction_date: daysAgo(14) },
    { id: "demo-10", type: "expense", amount: 35_000, description: "Kopi di kedai langganan", transaction_date: daysAgo(16) },
  ];
}