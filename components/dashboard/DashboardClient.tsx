"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AddTransactionForm } from "@/components/dashboard/AddTransactionForm";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { PeriodNavigator } from "@/components/dashboard/PeriodNavigator";
import {
  RecentTransactions,
} from "@/components/dashboard/RecentTransactions";
import { Toast, type ToastData } from "@/components/dashboard/Toast";
import { formatPeriod } from "@/lib/dashboard/format";
import {
  calculateSummary,
  currentPeriod,
  filterByPeriod,
  sortNewestFirst,
} from "@/lib/dashboard/summary";
import { fetchTransactionsClient } from "@/lib/dashboard/transactions";
import type {
  Period,
  Transaction,
} from "@/lib/dashboard/types";
import type { PublicUser } from "@/lib/auth/session";

interface DashboardClientProps {
  /** User dari session (dioper Server Component, bukan hardcode). */
  user: PublicUser;
  /** Data awal hasil fetch server-side. */
  initialTransactions: Transaction[];
}

const RECENT_LIMIT = 5;

/**
 * Orkestrasi interaktif dashboard: periode, daftar, form, dan toast.
 * Setelah tambah transaksi sukses, daftar + ringkasan ter-update
 * otomatis tanpa reload (state lokal + refetch sinkronisasi).
 */
export function DashboardClient({
  user,
  initialTransactions,
}: DashboardClientProps) {
  const router = useRouter();
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [period, setPeriod] = useState<Period>(() => currentPeriod());
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const periodLabel = formatPeriod(period.year, period.month);

  const visible = useMemo(
    () => sortNewestFirst(filterByPeriod(transactions, period)),
    [transactions, period],
  );
  const summary = useMemo(() => calculateSummary(visible), [visible]);
  const recent = useMemo(
    () => visible.slice(0, RECENT_LIMIT),
    [visible],
  );

  const handleUnauthorized = () => {
    setToast({
      kind: "error",
      message: "Sesi berakhir. Kamu akan diarahkan ke halaman login.",
    });
    router.push("/login");
  };

  const handleRetry = async () => {
    setRefreshing(true);
    setLoadError(null);
    try {
      const data = await fetchTransactionsClient(
        user.id,
        handleUnauthorized,
      );
      setTransactions(data);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data transaksi.",
      );
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <FinancialSummary
        userName={user.name}
        summary={summary}
        periodLabel={periodLabel}
        onAdd={() => setFormOpen(true)}
      />

      <PeriodNavigator period={period} onChange={setPeriod} />

      {loadError ? (
        <div
          role="alert"
          className="rounded-2xl border border-expense bg-surface p-8 text-center"
        >
          <h2 className="text-base font-semibold text-expense">
            Gagal memuat data dashboard
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {loadError} Periksa koneksi internetmu lalu coba lagi.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={refreshing}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[10px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? "Memuat…" : "Coba lagi"}
          </button>
        </div>
      ) : (
        <RecentTransactions
          transactions={recent}
          periodLabel={periodLabel}
          onAdd={() => setFormOpen(true)}
        />
      )}

      <AddTransactionForm
        userId={user.id}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={(created) => {
          setTransactions((prev) => sortNewestFirst([created, ...prev]));
          setFormOpen(false);
          setToast({
            kind: "success",
            message: "Transaksi tersimpan. Ringkasan diperbarui.",
          });
        }}
        onError={(message) => {
          setToast({ kind: "error", message });
        }}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
