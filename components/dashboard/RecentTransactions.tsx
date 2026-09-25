import Link from "next/link";
import {
  formatRupiah,
  formatTransactionDate,
} from "@/lib/dashboard/format";
import type { Transaction } from "@/lib/dashboard/types";

interface RecentTransactionsProps {
  /** Sudah difilter periode aktif, terbaru dulu, dibatasi pemanggil. */
  transactions: Transaction[];
  /** Label periode aktif untuk konteks empty state. */
  periodLabel: string;
  /** Membuka form tambah transaksi (CTA empty state). */
  onAdd: () => void;
}

/**
 * Daftar transaksi terbaru dalam periode aktif (FR-06, FR-08).
 * Jenis dibedakan dengan label + warna (`--income`/`--expense`) plus
 * tanda `+`/`−` — bukan warna saja (DESIGN.md). Nominal rata kanan
 * tabular-nums. Murni presentasional.
 */
export function RecentTransactions({
  transactions,
  periodLabel,
  onAdd,
}: RecentTransactionsProps) {
  return (
    <section aria-label="Transaksi terbaru">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Transaksi terbaru</h2>
        <Link
          href="/riwayat"
          className="inline-flex h-10 items-center rounded-[10px] px-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-muted"
        >
          Lihat semua
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm font-medium">
            Belum ada transaksi pada {periodLabel}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Catat pemasukan atau pengeluaran pertamamu bulan ini agar
            ringkasan di atas terisi.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[10px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Tambah transaksi
          </button>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {transactions.map((trx) => {
            const isIncome = trx.type === "income";
            return (
              <li
                key={trx.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {trx.description}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <time dateTime={trx.date}>
                      {formatTransactionDate(trx.date)}
                    </time>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isIncome
                          ? "bg-surface-muted text-income"
                          : "bg-surface-muted text-expense"
                      }`}
                    >
                      {isIncome ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </p>
                </div>
                <p
                  className={`tnum shrink-0 text-sm font-bold ${
                    isIncome ? "text-income" : "text-expense"
                  }`}
                >
                  {isIncome ? "+" : "−"}
                  {formatRupiah(trx.amount)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Skeleton daftar transaksi; menjaga dimensi layout (DESIGN.md). */
export function RecentTransactionsSkeleton() {
  return (
    <section aria-label="Transaksi terbaru sedang dimuat" aria-busy="true">
      <div className="flex items-center justify-between gap-4">
        <div className="h-7 w-44 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-10 w-24 animate-pulse rounded-[10px] bg-surface-muted" />
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
            </div>
            <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}
