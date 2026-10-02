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
 * Akses transaksi milik user yang login lewat AJAX (FR-13). `userId` tidak
 * pernah dikirim dari client; server menentukannya dari session (FR-20).
 * Bentuk data dari API memakai field `date`, dipetakan ke `transaction_date`
 * agar cocok dengan komponen riwayat/filter.
 */
export async function getTransactions(): Promise<Transaction[]> {
  const data = await request<unknown>("/");
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.data)) {
      return normalizeTransactions(record.data);
    }
    if (Array.isArray(record.transactions)) {
      return normalizeTransactions(record.transactions);
    }
  }
  if (Array.isArray(data)) {
    return normalizeTransactions(data);
  }
  throw new TransactionApiError("Respons transaksi tidak sesuai format.", 0);
}

export async function createTransaction(
  payload: TransactionPayload
): Promise<Transaction> {
  const data = await request<{ data?: unknown }>("/", {
    method: "POST",
    body: JSON.stringify({
      type: payload.type,
      amount: payload.amount,
      description: payload.description,
      date: payload.transaction_date,
    }),
  });

  if (data && typeof data === "object" && data.data) {
    return normalizeTransaction(data.data);
  }
  throw new TransactionApiError("Respons transaksi tidak sesuai format.", 0);
}

export async function deleteTransaction(id: string): Promise<void> {
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

function normalizeTransaction(item: unknown): Transaction {
  const raw = (item ?? {}) as Record<string, unknown>;
  const type: TransactionType = raw.type === "expense" ? "expense" : "income";
  return {
    id: String(raw.id ?? ""),
    type,
    amount: Number(raw.amount ?? 0),
    description: String(raw.description ?? ""),
    transaction_date: String(raw.transaction_date ?? raw.date ?? ""),
  };
}

function normalizeTransactions(list: unknown[]): Transaction[] {
  return list.map(normalizeTransaction);
}
