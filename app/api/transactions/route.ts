import { NextResponse } from "next/server";
import { buildMockTransactions } from "@/lib/dashboard/mock";
import type {
  Transaction,
  TransactionType,
} from "@/lib/dashboard/types";

/**
 * ------------------------------------------------------------------
 * STUB SEMENTARA milik dashboard (Anggota 3).
 *
 * TODO (Anggota 2 — database & backend transaksi): ganti seluruh isi
 * route ini dengan implementasi asli:
 * - GET: query tabel Transactions WHERE user_id = ? milik user dari
 *   session (BUKAN dari query param semata), kembalikan
 *   `200 { data: Transaction[] }`. Tolak akses ke user_id lain (FR-05).
 * - POST: validasi (FR-07), paksa `user_id` dari session, INSERT ke
 *   database, kembalikan `201 { data: Transaction }`.
 * - Balikan 401 bila session tidak valid (FR-05 ayat 5).
 *
 * Selama stub ini dipakai, data contoh ditempelkan ke `user_id` dari
 * session/query sehingga tidak ada user hardcode di komponen.
 * POST menyimpan ke memori proses dev saja (hilang saat restart) —
 * cukup untuk demo update-otomatis tanpa reload.
 * ------------------------------------------------------------------
 */

let memoryStore: Transaction[] | null = null;

function storeFor(userId: string): Transaction[] {
  if (!memoryStore || !memoryStore.every((trx) => trx.user_id === userId)) {
    memoryStore = buildMockTransactions(userId);
  }
  return memoryStore;
}

function isValidType(value: unknown): value is TransactionType {
  return value === "income" || value === "expense";
}

function isValidDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(`${value}T00:00:00`).getTime())
  );
}

/** GET /api/transactions?user_id=<id> -> 200 { data: Transaction[] } */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json(
      { message: "Parameter user_id wajib diisi." },
      { status: 400 },
    );
  }
  // TODO (Anggota 2): ambil dari database + cek session (FR-05).
  const data = storeFor(userId).filter((trx) => trx.user_id === userId);
  return NextResponse.json({ data });
}

/** POST /api/transactions -> 201 { data: Transaction } */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { message: "Body request harus JSON yang valid." },
      { status: 400 },
    );
  }

  const userId = body.user_id;
  if (typeof userId !== "string" || !userId) {
    return NextResponse.json(
      { message: "user_id wajib diisi dari session." },
      { status: 400 },
    );
  }
  if (!isValidType(body.type)) {
    return NextResponse.json(
      { message: "Jenis transaksi harus Pemasukan atau Pengeluaran." },
      { status: 400 },
    );
  }
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { message: "Nominal harus angka lebih dari 0." },
      { status: 400 },
    );
  }
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (!description) {
    return NextResponse.json(
      { message: "Deskripsi wajib diisi." },
      { status: 400 },
    );
  }
  if (!isValidDate(body.date)) {
    return NextResponse.json(
      { message: "Tanggal tidak valid." },
      { status: 400 },
    );
  }

  // TODO (Anggota 2): INSERT ke database dengan user_id dari session.
  const created: Transaction = {
    id: `trx-${Date.now()}`,
    user_id: userId,
    type: body.type,
    amount: Math.floor(amount),
    description,
    date: body.date,
  };
  storeFor(userId).unshift(created);
  return NextResponse.json({ data: created }, { status: 201 });
}
