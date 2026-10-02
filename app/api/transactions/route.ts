import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createTransaction, getTransactions } from "@/lib/transactions/data";
import { transactionInputSchema } from "@/lib/transactions/schema";
import { toWireTransaction } from "@/lib/transactions/wire";

/**
 * Endpoint transaksi milik user yang sedang login (FR-07, FR-13, FR-20).
 *
 * `userId` selalu diambil dari session di server — bukan dari body/query —
 * sehingga pengguna tidak dapat membaca atau menulis transaksi milik akun
 * lain. Semua respons memakai bentuk yang dikonsumsi UI (lihat `wire.ts`).
 */

export async function GET() {
  const userId = await getCurrentUserId();
  if (userId == null) {
    return NextResponse.json({ message: "Sesi berakhir." }, { status: 401 });
  }

  const rows = await getTransactions(userId, "all");
  return NextResponse.json({ data: rows.map((row) => toWireTransaction(row, userId)) });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (userId == null) {
    return NextResponse.json({ message: "Sesi berakhir." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { message: "Body request harus JSON yang valid." },
      { status: 400 },
    );
  }

  // `date` dan `transaction_date` diterima demi kompatibilitas dua UI layer;
  // keduanya dipetakan ke satu skema validasi.
  const parsed = transactionInputSchema.safeParse({
    type: body.type,
    amount: typeof body.amount === "number" ? String(body.amount) : body.amount,
    description: body.description,
    transactionDate: body.date ?? body.transaction_date,
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Data transaksi tidak valid.";
    return NextResponse.json({ message: firstIssue }, { status: 400 });
  }

  try {
    const created = await createTransaction(userId, parsed.data);
    return NextResponse.json(
      { data: toWireTransaction(created, userId) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Gagal menyimpan transaksi:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan transaksi. Coba lagi." },
      { status: 500 },
    );
  }
}
