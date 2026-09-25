import { formatRupiah } from "@/lib/dashboard/summary";
import type { FinancialSummary } from "@/lib/dashboard/types";

interface FinancialSummaryProps {
  /** Nama pengguna yang sedang login (dari session, bukan hardcode). */
  userName: string;
  summary: FinancialSummary;
}

/**
 * Kartu ringkasan keuangan — reusable, murni presentasional.
 * Bisa dipakai ulang di halaman lain cukup dengan mengoper
 * `userName` + `summary` (hasil `calculateFinancialSummary()`).
 */
export function FinancialSummary({ userName, summary }: FinancialSummaryProps) {
  const cards = [
    {
      label: "Total Pemasukan",
      value: formatRupiah(summary.totalIncome),
      valueClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Pengeluaran",
      value: formatRupiah(summary.totalExpense),
      valueClass: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Saldo",
      value: formatRupiah(summary.balance),
      valueClass:
        summary.balance < 0
          ? "text-rose-600 dark:text-rose-400"
          : "text-zinc-900 dark:text-zinc-50",
    },
  ];

  return (
    <section aria-label="Ringkasan keuangan">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Halo, {userName}
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Berikut ringkasan keuanganmu.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {card.label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${card.valueClass}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Skeleton pengganti FinancialSummary saat data sedang dimuat. */
export function FinancialSummarySkeleton() {
  return (
    <section aria-label="Ringkasan keuangan sedang dimuat" aria-busy="true">
      <div className="h-7 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-3 h-8 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </section>
  );
}
