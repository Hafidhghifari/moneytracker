import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { TransactionType } from "@/lib/transactions";
import { TRANSACTION_TYPE_LABEL } from "@/lib/transactions";

export function TransactionTypeIcon({
  type,
  className = "size-5",
}: {
  type: TransactionType;
  className?: string;
}) {
  const Icon = type === "income" ? ArrowDownLeft : ArrowUpRight;
  const tone = type === "income" ? "text-income" : "text-expense";
  return <Icon className={`${className} ${tone}`} aria-hidden="true" />;
}

export function TypePill({ type }: { type: TransactionType }) {
  const isIncome = type === "income";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isIncome
          ? "bg-income/10 text-income"
          : "bg-expense/10 text-expense",
      ].join(" ")}
    >
      <TransactionTypeIcon type={type} className="size-3.5" />
      {TRANSACTION_TYPE_LABEL[type]}
    </span>
  );
}