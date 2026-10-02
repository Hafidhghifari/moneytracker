"use client";

import { TRANSACTION_TYPE_LABEL } from "@/lib/transactions";
import type { Transaction, TransactionType } from "@/lib/transactions";

export type TransactionFilter = "all" | TransactionType;

interface TransactionFilterProps {
  value: TransactionFilter;
  onChange: (value: TransactionFilter) => void;
  transactions: Transaction[];
}

const options: Array<{ value: TransactionFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "income", label: TRANSACTION_TYPE_LABEL.income },
  { value: "expense", label: TRANSACTION_TYPE_LABEL.expense },
];

function countFor(
  filter: TransactionFilter,
  transactions: Transaction[]
): number {
  if (filter === "all") return transactions.length;
  return transactions.filter((item) => item.type === filter).length;
}

export function TransactionFilterControl({
  value,
  onChange,
  transactions,
}: TransactionFilterProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter jenis transaksi"
      className="inline-flex max-w-full items-center gap-1 rounded-[10px] bg-surface-muted p-1"
    >
      {options.map((option) => {
        const active = value === option.value;
        const count = countFor(option.value, transactions);
        const tone =
          option.value === "income"
            ? "text-income"
            : option.value === "expense"
              ? "text-expense"
              : "text-foreground";
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={[
              "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              active
                ? "border border-border bg-surface text-foreground shadow-sm"
                : "border border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {option.label}
            <span
              className={`rounded-full px-1.5 py-px text-xs tabular-nums ${
                active ? `${tone} bg-surface-muted` : "bg-surface/60 text-muted-foreground"
              }`}
              aria-label={`${count} transaksi`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}