"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { formatPeriod, formatRupiah } from "@/lib/dashboard/format";
import type { Period } from "@/lib/dashboard/types";

interface Budget {
  year: number;
  month: number;
  amount: number;
}

interface MonthlyBudgetCardProps {
  period: Period;
  totalExpense: number;
}

function progressTone(percentage: number) {
  if (percentage >= 100) return "bg-expense";
  if (percentage >= 80) return "bg-warning";
  return "bg-primary";
}

export function MonthlyBudgetCard({ period, totalExpense }: MonthlyBudgetCardProps) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [amount, setAmount] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setNotice("");
    setBudget(null);
    setAmount("");
    setEditing(false);

    void fetch(`/api/monthly-budget?year=${period.year}&month=${period.month}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          budget?: { year: number; month: number; amount: string } | null;
          message?: string;
        };
        if (!response.ok) throw new Error(result.message ?? "Anggaran tidak dapat dimuat.");
        const next = result.budget
          ? { ...result.budget, amount: Number(result.budget.amount) }
          : null;
        setBudget(next);
        setAmount(next ? String(next.amount) : "");
        setEditing(!next);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Anggaran tidak dapat dimuat.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [period.year, period.month, reloadVersion]);

  const usage = useMemo(() => {
    if (!budget || budget.amount <= 0) return 0;
    return (totalExpense / budget.amount) * 100;
  }, [budget, totalExpense]);

  async function saveBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 9_999_999_999.99) {
      setError("Masukkan anggaran lebih dari Rp0 dan maksimal Rp9.999.999.999,99.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/monthly-budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...period, amount: parsedAmount }),
      });
      const result = (await response.json()) as {
        budget?: { year: number; month: number; amount: string };
        message?: string;
      };
      if (!response.ok || !result.budget) {
        throw new Error(result.message ?? "Anggaran belum dapat disimpan.");
      }
      const next = { ...result.budget, amount: Number(result.budget.amount) };
      setBudget(next);
      setAmount(String(next.amount));
      setEditing(false);
      setNotice("Anggaran berhasil disimpan.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Anggaran belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  }

  const clampedUsage = Math.min(Math.max(usage, 0), 100);
  const status = usage >= 100
    ? "Anggaran terlampaui"
    : usage >= 80
      ? "Mendekati batas anggaran"
      : totalExpense > 0
        ? "Masih dalam batas anggaran"
        : "Belum ada pengeluaran";

  return (
    <section aria-labelledby="monthly-budget-title" className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Monthly Budget</p>
          <h2 id="monthly-budget-title" className="mt-1 text-lg font-semibold">Anggaran {formatPeriod(period.year, period.month)}</h2>
        </div>
        {!loading && budget && !editing && (
          <button
            type="button"
            onClick={() => { setAmount(String(budget.amount)); setEditing(true); setError(""); setNotice(""); }}
            className="inline-flex min-h-10 items-center justify-center rounded-[10px] border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            Ubah anggaran
          </button>
        )}
      </div>

      {loading ? (
        <div aria-label="Memuat anggaran" aria-busy="true" className="mt-5 space-y-3">
          <div className="h-7 w-44 animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-full animate-pulse rounded-full bg-surface-muted" />
        </div>
      ) : editing ? (
        <form className="mt-5" onSubmit={saveBudget}>
          <label htmlFor="monthly-budget-amount" className="text-sm font-medium">Nominal anggaran bulanan</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
              <input
                id="monthly-budget-amount"
                type="number"
                inputMode="decimal"
                min="1"
                max="9999999999.99"
                step="0.01"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Contoh: 2000000"
                disabled={saving}
                className="h-11 w-full rounded-[10px] border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Menyimpan…" : budget ? "Simpan perubahan" : "Simpan anggaran"}
            </button>
            {budget && (
              <button
                type="button"
                disabled={saving}
                onClick={() => { setAmount(String(budget.amount)); setEditing(false); setError(""); }}
                className="inline-flex h-11 items-center justify-center rounded-[10px] px-4 text-sm font-medium text-muted-foreground hover:bg-surface-muted disabled:opacity-60"
              >
                Batal
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Anggaran disimpan untuk {formatPeriod(period.year, period.month)}.</p>
        </form>
      ) : budget ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Anggaran bulanan</p>
              <p className="tnum mt-1 text-2xl font-semibold tracking-tight">{formatRupiah(budget.amount)}</p>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{formatRupiah(totalExpense)} terpakai</p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div
              role="meter"
              aria-label="Penggunaan anggaran"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(clampedUsage)}
              aria-valuetext={`${Math.round(usage)} persen digunakan`}
              className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-muted"
            >
              <div className={`h-full rounded-full transition-[width] duration-300 ${progressTone(usage)}`} style={{ width: `${clampedUsage}%` }} />
            </div>
            <span className="tnum min-w-12 text-right text-sm font-semibold">{Math.round(usage)}%</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <p className={usage >= 100 ? "font-semibold text-expense" : usage >= 80 ? "font-semibold text-warning" : "text-muted-foreground"}>
              {status}
            </p>
            <p className="text-muted-foreground">
              {totalExpense <= budget.amount ? "Sisa" : "Melebihi sebesar"} {formatRupiah(Math.abs(budget.amount - totalExpense))}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          {error ? "Anggaran belum berhasil dimuat." : "Belum ada anggaran untuk bulan ini."}
        </p>
      )}

      {error && <p role="alert" className="mt-3 rounded-[10px] border border-expense/30 bg-expense/5 px-3 py-2 text-sm text-expense">{error}</p>}
      {error && !loading && !editing && (
        <button
          type="button"
          onClick={() => setReloadVersion((version) => version + 1)}
          className="mt-3 min-h-10 rounded-[10px] border border-border px-4 text-sm font-medium hover:bg-surface-muted"
        >
          Coba lagi
        </button>
      )}
      {notice && <p role="status" className="mt-3 text-sm text-info">{notice}</p>}
    </section>
  );
}
