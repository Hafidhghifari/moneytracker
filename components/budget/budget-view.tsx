"use client";

import { useCallback, useEffect, useState } from "react";
import { PeriodNavigator } from "@/components/dashboard/PeriodNavigator";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { toMonthKey } from "@/lib/budget/schema";
import type { BudgetSummaryDTO } from "@/lib/budget/schema";
import { currentPeriod } from "@/lib/dashboard/summary";
import type { Period } from "@/lib/dashboard/types";
import { BudgetIndicator } from "./budget-indicator";
import { BudgetSummary } from "./budget-summary";
import { SetBudgetForm } from "./set-budget-form";

type LoadState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; message: string };

function messageOfPayload(payload: unknown): string | null {
  if (payload && typeof payload === "object" && "message" in payload) {
    const value = (payload as { message?: unknown }).message;
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

export function BudgetView() {
  const [period, setPeriod] = useState<Period>(() => currentPeriod());
  const [data, setData] = useState<BudgetSummaryDTO | null>(null);
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const monthKey = toMonthKey(period);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoadState({ status: "loading" });
      try {
        const response = await fetch(
          `/api/budget?month=${encodeURIComponent(monthKey)}`,
          { cache: "no-store", signal },
        );
        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(messageOfPayload(payload) ?? "Gagal memuat data budget.");
        }

        const summary =
          payload && typeof payload === "object" && "data" in payload
            ? ((payload as { data?: unknown }).data as BudgetSummaryDTO | undefined)
            : undefined;

        if (!summary) {
          throw new Error("Respons budget tidak sesuai format.");
        }

        setData(summary);
        setLoadState({ status: "ready" });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Terjadi kesalahan.",
        });
      }
    },
    [monthKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    // Skeleton sengaja ditampilkan sinkron saat bulan berubah.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="max-w-sm">
        <PeriodNavigator period={period} onChange={setPeriod} />
      </div>

      {loadState.status === "loading" ? (
        <Panel className="p-6">
          <p className="text-sm text-muted-foreground">Memuat data budget…</p>
        </Panel>
      ) : null}

      {loadState.status === "error" ? (
        <Panel className="p-6">
          <p className="text-sm text-expense">{loadState.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => void load()}>
            Coba lagi
          </Button>
        </Panel>
      ) : null}

      {loadState.status === "ready" && data ? (
        <>
          <BudgetSummary data={data} />
          <BudgetIndicator data={data} />
          <SetBudgetForm
            key={monthKey}
            month={monthKey}
            currentAmount={data.budgetAmount}
            onSaved={() => void load()}
          />
        </>
      ) : null}
    </div>
  );
}
