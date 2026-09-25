"use client";

import { formatPeriod } from "@/lib/dashboard/format";
import type { Period } from "@/lib/dashboard/types";

interface PeriodNavigatorProps {
  period: Period;
  onChange: (period: Period) => void;
}

/**
 * Navigasi periode bulan `< [Bulan Tahun] >` (DESIGN.md hero/topbar).
 * Label memakai `Intl.DateTimeFormat('id-ID', ...)` via `formatPeriod`.
 */
export function PeriodNavigator({ period, onChange }: PeriodNavigatorProps) {
  const shift = (delta: -1 | 1) => {
    const date = new Date(period.year, period.month - 1 + delta, 1);
    onChange({ year: date.getFullYear(), month: date.getMonth() + 1 });
  };

  const label = formatPeriod(period.year, period.month);

  return (
    <nav
      aria-label="Navigasi periode bulan"
      className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-2 py-2"
    >
      <button
        type="button"
        onClick={() => shift(-1)}
        aria-label="Bulan sebelumnya"
        className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-lg text-foreground transition-colors hover:bg-surface-muted"
      >
        <span aria-hidden="true">‹</span>
      </button>
      <p aria-live="polite" className="text-sm font-semibold">
        {label}
      </p>
      <button
        type="button"
        onClick={() => shift(1)}
        aria-label="Bulan berikutnya"
        className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-lg text-foreground transition-colors hover:bg-surface-muted"
      >
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
}
