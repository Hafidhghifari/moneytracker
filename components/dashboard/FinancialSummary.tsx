import { formatRupiah } from "@/lib/dashboard/format";
import type { FinancialSummary as Summary } from "@/lib/dashboard/types";

interface FinancialSummaryProps {
  /** Nama asli user dari session — bukan hardcode. */
  userName: string;
  summary: Summary;
  /** Label periode aktif, mis. "September 2026". */
  periodLabel: string;
  onAdd: () => void;
}

/**
 * Hero sapaan + tiga kartu metrik (FR-06, DESIGN.md "Kartu metrik").
 * Murni presentasional (Server Component OK). Saldo paling menonjol
 * secara tipografi (32–40 px), pemasukan/pengeluaran 22–28 px.
 */
export function FinancialSummary({
  userName,
  summary,
  periodLabel,
  onAdd,
}: FinancialSummaryProps) {
  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Ringkasan utama" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight sm:text-4xl">
              Halo, {userName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ringkasan keuangan periode {periodLabel}. Saldo dihitung dari
              total pemasukan dikurangi total pengeluaran.
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Tambah transaksi
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <p className="text-sm font-medium text-muted-foreground">Saldo</p>
          <p className="tnum mt-2 text-4xl font-medium tracking-tight sm:text-[40px]">
            {formatRupiah(summary.balance)}
          </p>
        </div>
      </section>

      <section aria-label="Total pemasukan dan pengeluaran">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Total pemasukan
            </p>
            <p className="tnum mt-2 text-2xl font-semibold text-income">
              +{formatRupiah(summary.totalIncome)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Periode {periodLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Total pengeluaran
            </p>
            <p className="tnum mt-2 text-2xl font-semibold text-expense">
              −{formatRupiah(summary.totalExpense)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Periode {periodLabel}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Skeleton hero + metrik; menjaga dimensi layout (DESIGN.md Loading). */
export function FinancialSummarySkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-label="Ringkasan keuangan sedang dimuat"
      aria-busy="true"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="h-9 w-56 animate-pulse rounded-lg bg-surface-muted" />
          <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-surface-muted" />
        </div>
        <div className="h-11 w-44 animate-pulse rounded-[10px] bg-surface-muted" />
      </div>
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
        <div className="mt-3 h-10 w-64 max-w-full animate-pulse rounded-lg bg-surface-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
          >
            <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
            <div className="mt-3 h-7 w-48 max-w-full animate-pulse rounded-lg bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
