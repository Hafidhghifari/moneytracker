"use client";

import { useEffect, useState } from "react";
import {
  FinancialSummary,
  FinancialSummarySkeleton,
} from "@/components/dashboard/FinancialSummary";
import {
  RecentTransactions,
  RecentTransactionsSkeleton,
} from "@/components/dashboard/RecentTransactions";
import {
  calculateFinancialSummary,
  getRecentTransactions,
} from "@/lib/dashboard/summary";
import { getTransactionsByUserId } from "@/lib/dashboard/transactions";
import type {
  SessionUser,
  Transaction,
} from "@/lib/dashboard/types";

type Status = "loading" | "success" | "error";

interface DashboardContentProps {
  /** User yang sedang login — dioper dari Server Component, bukan hardcode. */
  user: SessionUser;
}

/**
 * Isi halaman dashboard (Client Component).
 *
 * Mengambil transaksi milik `user.id` dari session, lalu menghitung
 * ringkasan di sisi klien memakai fungsi murni `calculateFinancialSummary`
 * / `getRecentTransactions` sehingga mudah diuji dan dipakai ulang.
 * Menangani state loading (skeleton) dan error (pesan + tombol retry).
 */
export function DashboardContent({ user }: DashboardContentProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  // Dinaikkan tiap tombol "Coba lagi" ditekan untuk mengulang fetch.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getTransactionsByUserId(user.id).then(
      (data) => {
        if (cancelled) return;
        setTransactions(data);
        setStatus("success");
      },
      (error: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data transaksi."
        );
        setStatus("error");
      }
    );

    return () => {
      cancelled = true;
    };
  }, [user.id, attempt]);

  const handleRetry = () => {
    setStatus("loading");
    setErrorMessage("");
    setAttempt((n) => n + 1);
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-8">
        <FinancialSummarySkeleton />
        <RecentTransactionsSkeleton />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950/40"
      >
        <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-300">
          Gagal memuat data dashboard
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-rose-600 dark:text-rose-400">
          {errorMessage || "Terjadi kesalahan saat mengambil data."} Periksa
          koneksi internetmu lalu coba lagi.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-rose-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  const summary = calculateFinancialSummary(transactions);
  const recent = getRecentTransactions(transactions, 5);

  return (
    <div className="flex flex-col gap-8">
      <FinancialSummary userName={user.name} summary={summary} />
      <RecentTransactions transactions={recent} />
    </div>
  );
}
