import { Panel } from "@/components/ui/panel";
import type { BudgetSummaryDTO } from "@/lib/budget/schema";
import { formatCurrency } from "@/lib/format";

export function BudgetSummary({ data }: { data: BudgetSummaryDTO }) {
  return (
    <Panel className="p-5">
      <h3 className="text-lg font-semibold text-foreground">Budget Summary</h3>
      {!data.hasBudget ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Belum ada anggaran untuk bulan ini. Tentukan anggaran melalui form di
          bawah.
        </p>
      ) : null}
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Anggaran</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
            {data.hasBudget ? formatCurrency(data.budgetAmount) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Total Pengeluaran</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-expense">
            {formatCurrency(data.totalExpense)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Sisa Anggaran</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
            {data.hasBudget ? formatCurrency(data.remaining) : "—"}
          </dd>
        </div>
      </dl>
    </Panel>
  );
}
