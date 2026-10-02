import { Panel } from "@/components/ui/panel";
import type { BudgetSummaryDTO } from "@/lib/budget/schema";

export function BudgetIndicator({ data }: { data: BudgetSummaryDTO }) {
  const percentage = data.percentage;
  const clamped = percentage === null ? 0 : Math.min(Math.max(percentage, 0), 100);

  return (
    <Panel className="p-5">
      <h3 className="text-lg font-semibold text-foreground">Budget Indicator</h3>
      {percentage === null ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Indikator tersedia setelah anggaran bulan ini ditentukan.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Penggunaan anggaran:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {percentage.toFixed(1)}%
            </span>
          </p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              role="progressbar"
              aria-valuenow={Math.round(clamped)}
              aria-valuemin={0}
              aria-valuemax={100}
              className={`h-full rounded-full ${
                percentage > 100 ? "bg-expense" : "bg-primary"
              }`}
              style={{ width: `${clamped}%` }}
            />
          </div>
        </>
      )}
    </Panel>
  );
}
