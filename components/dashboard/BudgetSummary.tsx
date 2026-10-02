"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchBudgetSummary } from "@/lib/budget/client";
import { currentPeriod } from "@/lib/dashboard/summary";
import { formatRupiah } from "@/lib/dashboard/format";
import type { Period } from "@/lib/dashboard/types";

/** Nama bulan Indonesia via Intl (konvensi lib/dashboard/format.ts). */
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const label = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
    new Date(2026, index, 1),
  );
  return {
    value: index + 1,
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
});

/** Pilihan tahun: dua tahun lalu s.d. satu tahun depan. */
function yearOptions(): number[] {
  const current = new Date().getFullYear();
  return [current - 2, current - 1, current, current + 1];
}

const selectClassName =
  "h-11 rounded-[10px] border border-border bg-surface px-3 text-sm font-medium text-foreground";

/**
 * Budget Summary per bulan (FR-17 + FR-19 bagian pemilih bulan,
 * milik Anggota 1). Data diambil via AJAX setiap bulan/tahun berubah —
 * tanpa reload halaman. Murni baca + pilih periode; form Set Budget
 * adalah bagian Anggota 4 dan indikator adalah bagian Anggota 4
 * (slot kosong di bawah, JANGAN diisi di sini).
 */
export function BudgetSummary() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>(() => currentPeriod());
  const periodRef = useRef(period);
  const [budget, setBudget] = useState<number | null>(null);
  const [totalExpense, setTotalExpense] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const years = useMemo(() => yearOptions(), []);

  const handleUnauthorized = useCallback(() => {
    router.push("/login");
  }, [router]);

  const load = useCallback(
    async (target: Period) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBudgetSummary(target, handleUnauthorized);
        setBudget(data.budget);
        setTotalExpense(data.total_expense);
        setRemaining(data.remaining);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ringkasan budget belum dapat dimuat.",
        );
      } finally {
        setLoading(false);
      }
    },
    [handleUnauthorized],
  );

  // Muat awal via AJAX. setState hanya di continuation promise (async),
  // bukan sinkron di body effect (react-hooks/set-state-in-effect).
  // Ganti bulan/tahun memanggil `load` dari handler (di bawah), bukan
  // dari effect.
  useEffect(() => {
    let active = true;
    fetchBudgetSummary(period, handleUnauthorized).then(
      (data) => {
        if (!active) return;
        setBudget(data.budget);
        setTotalExpense(data.total_expense);
        setRemaining(data.remaining);
        setLoading(false);
      },
      (err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Ringkasan budget belum dapat dimuat.",
        );
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleUnauthorized]);

  const changePeriod = (patch: Partial<Period>) => {
    const next = { ...periodRef.current, ...patch };
    periodRef.current = next;
    setPeriod(next);
    void load(next);
  };

  return (
    <section
      aria-label="Ringkasan budget"
      className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Ringkasan budget</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Anggaran dan pengeluaran bulan yang dipilih.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="budget-month" className="sr-only">
            Pilih bulan
          </label>
          <select
            id="budget-month"
            className={selectClassName}
            value={period.month}
            onChange={(event) =>
              changePeriod({ month: Number(event.target.value) })
            }
          >
            {MONTH_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label htmlFor="budget-year" className="sr-only">
            Pilih tahun
          </label>
          <select
            id="budget-year"
            className={selectClassName}
            value={period.year}
            onChange={(event) =>
              changePeriod({ year: Number(event.target.value) })
            }
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div aria-label="Ringkasan budget sedang dimuat" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4 first:border-0 first:pt-0"
            >
              <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
              <div className="h-5 w-36 animate-pulse rounded bg-surface-muted" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="mt-4 text-center">
          <p className="text-sm text-expense">{error}</p>
          <button
            type="button"
            onClick={() => void load(period)}
            className="mt-3 inline-flex h-11 items-center justify-center rounded-[10px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="mt-2">
          {budget === null ? (
            <p className="mt-4 rounded-[10px] border border-dashed border-border bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
              Budget belum ditentukan untuk bulan ini. Atur melalui form Set
              Budget.
            </p>
          ) : null}
          <dl className="mt-4 border-t border-border">
            <div className="flex items-center justify-between gap-4 pt-4">
              <dt className="text-sm text-muted-foreground">Anggaran</dt>
              <dd className="tnum text-base font-semibold">
                {budget === null ? "Belum ditentukan" : formatRupiah(budget)}
              </dd>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
              <dt className="text-sm text-muted-foreground">
                Total pengeluaran
              </dt>
              <dd className="tnum text-base font-semibold text-expense">
                {formatRupiah(totalExpense)}
              </dd>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
              <dt className="text-sm text-muted-foreground">Sisa anggaran</dt>
              <dd className="tnum text-base font-semibold">
                {budget === null ? "—" : formatRupiah(remaining)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/*
        Slot Budget Indicator — milik Anggota 4.
        JANGAN implementasikan indikator di sini; cukup render ke
        elemen ini (id="budget-indicator-slot").
      */}
      <div id="budget-indicator-slot" data-budget-indicator-slot />
    </section>
  );
}
