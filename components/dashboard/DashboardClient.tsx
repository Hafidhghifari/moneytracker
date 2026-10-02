"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AddTransactionForm } from "@/components/dashboard/AddTransactionForm";
import { BudgetSummary } from "@/components/dashboard/BudgetSummary";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { MonthlyBudgetCard } from "@/components/dashboard/MonthlyBudgetCard";
import { PeriodNavigator } from "@/components/dashboard/PeriodNavigator";
import {
  RecentTransactions,
} from "@/components/dashboard/RecentTransactions";
import { Toast, type ToastData } from "@/components/dashboard/Toast";
import { formatPeriod } from "@/lib/dashboard/format";
import {
  DASHBOARD_REFRESH_EVENT,
  fetchDashboardData,
} from "@/lib/dashboard/dashboard-api";
import {
  calculateSummary,
  currentPeriod,
  filterByPeriod,
  sortNewestFirst,
} from "@/lib/dashboard/summary";
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

declare global {
  interface Window {
    /**
     * Refresh dashboard via AJAX tanpa reload (FR-12, milik Anggota 1).
     * Diekspos agar bisa dipanggil ulang dari konsol/devtools atau kode
     * anggota lain, mis. `window.refreshDashboard?.()`.
     */
    refreshDashboard?: () => void;
  }
}

/**
 * Orkestrasi interaktif dashboard: periode, daftar, form, dan toast.
 * Setelah tambah transaksi sukses, daftar + ringkasan ter-update
 * otomatis tanpa reload (state lokal + refetch sinkronisasi).
 *
 * Data dimuat ulang lewat AJAX (`refreshDashboard`, FR-12): saat pertama
 * tampil (silent), lewat tombol "Coba lagi", lewat
 * `window.refreshDashboard()`, atau lewat event
 * `moneyhist:transactions-changed` (kontrak untuk Anggota 2 — cukup
 * dispatch event setelah tambah/hapus transaksi).
 */
export function DashboardClient({
  user,
  initialTransactions,
}: DashboardClientProps) {
  const router = useRouter();
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [userName, setUserName] = useState(user.name);
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

  const handleUnauthorized = useCallback(() => {
    setToast({
      kind: "error",
      message: "Sesi berakhir. Kamu akan diarahkan ke halaman login.",
    });
    router.push("/login");
  }, [router]);

  /**
   * Muat ulang data dashboard lewat AJAX tanpa reload halaman (FR-12).
   * Mode `silent`: gagal refresh tidak menimpa konten yang sudah ada —
   * cukup toast, bukan panel error.
   *
   * Dipanggil dari event handler / listener eksternal, BUKAN dari body
   * effect (react-hooks/set-state-in-effect). Untuk pemuatan awal, lihat
   * effect di bawah yang memakai promise-chain inline.
   */
  const transactionCountRef = useRef(transactions.length);
  useEffect(() => {
    transactionCountRef.current = transactions.length;
  });

  const refreshDashboard = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      setRefreshing(true);
      if (!silent) setLoadError(null);
      try {
        const data = await fetchDashboardData(handleUnauthorized);
        setTransactions(data.transactions);
        setUserName(data.user.name);
        setLoadError(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal mengambil data transaksi.";
        if (silent && transactionCountRef.current > 0) {
          setToast({ kind: "error", message });
        } else {
          setLoadError(message);
        }
      } finally {
        setRefreshing(false);
      }
    },
    [handleUnauthorized],
  );

  // Muat via AJAX saat pertama tampil (silent: toast saja bila gagal,
  // konten server tetap tampil) + dengarkan pemicu refresh eksternal.
  // setState hanya di dalam continuation promise (async), bukan sinkron
  // di body effect.
  useEffect(() => {
    let active = true;
    fetchDashboardData(handleUnauthorized).then(
      (data) => {
        if (!active) return;
        setTransactions(data.transactions);
        setUserName(data.user.name);
      },
      (error: unknown) => {
        if (!active) return;
        setToast({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Gagal mengambil data transaksi.",
        });
      },
    );
    const onExternalRefresh = () => {
      void refreshDashboard({ silent: true });
    };
    window.addEventListener(DASHBOARD_REFRESH_EVENT, onExternalRefresh);
    window.refreshDashboard = () => {
      void refreshDashboard();
    };
    return () => {
      active = false;
      window.removeEventListener(DASHBOARD_REFRESH_EVENT, onExternalRefresh);
      delete window.refreshDashboard;
    };
  }, [handleUnauthorized, refreshDashboard]);

  const handleRetry = () => {
    void refreshDashboard();
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {refreshing ? (
        <p
          role="status"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
          />
          Memperbarui data dashboard…
        </p>
      ) : null}
      <FinancialSummary
        userName={userName}
        summary={summary}
        periodLabel={periodLabel}
        onAdd={() => setFormOpen(true)}
      />

      <PeriodNavigator period={period} onChange={setPeriod} />

      <MonthlyBudgetCard
        key={`${period.year}-${period.month}`}
        period={period}
        totalExpense={summary.totalExpense}
      />

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

      <BudgetSummary />

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
