import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { deleteTransaction } from "@/lib/transactions/data";

const NOT_FOUND_MESSAGE = "Transaksi tidak ditemukan atau bukan milikmu.";

/**
 * Hapus transaksi milik user yang sedang login (FR-13, FR-20).
 * `userId` berasal dari session; transaksi milik akun lain tidak dapat
 * dihapus (dilaporkan sebagai 404, bukan 403, agar tidak membocorkan
 * keberadaan data pengguna lain).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (userId == null) {
    return NextResponse.json({ message: "Sesi berakhir." }, { status: 401 });
  }

  const { id } = await params;
  const transactionId = Number(id);
  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    return NextResponse.json({ message: NOT_FOUND_MESSAGE }, { status: 404 });
  }

  const deleted = await deleteTransaction(userId, transactionId);
  if (!deleted) {
    return NextResponse.json({ message: NOT_FOUND_MESSAGE }, { status: 404 });
  }

  return NextResponse.json({ data: { id } });
}
