import {
  formatRupiah,
  formatTransactionDate,
} from "@/lib/dashboard/summary";
import type { Transaction } from "@/lib/dashboard/types";

interface RecentTransactionsProps {
  /** Sudah diurutkan dari yang paling baru & dibatasi 5 item oleh pemanggil. */
  transactions: Transaction[];
}

/**
 * Daftar 5 transaksi terbaru — reusable, murni presentasional.
 * Pemasukan tampil hijau (+Rp...), pengeluaran tampil merah (-Rp...).
 */
export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <section aria-label="Transaksi terbaru">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Transaksi Terbaru
        </h2>
        <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Belum ada transaksi
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Transaksi terbaru">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Transaksi Terbaru
      </h2>
      <ul className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {transactions.map((trx) => {
          const isIncome = trx.type === "income";
          return (
            <li
              key={trx.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {trx.description}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatTransactionDate(trx.date)} ·{" "}
                  {isIncome ? "Pemasukan" : "Pengeluaran"}
                </p>
              </div>
              <p
                className={`shrink-0 text-sm font-bold ${
                  isIncome
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatRupiah(trx.amount)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Skeleton pengganti RecentTransactions saat data sedang dimuat. */
export function RecentTransactionsSkeleton() {
  return (
    <section aria-label="Transaksi terbaru sedang dimuat" aria-busy="true">
      <div className="h-7 w-44 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 last:border-0 dark:border-zinc-900"
          >
            <div className="min-w-0 flex-1">
              <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </section>
  );
}
