import { BudgetView } from "@/components/budget/budget-view";

export const metadata = {
  title: "Monthly Budget — Moneyhist",
  description: "Anggaran dan pengeluaran bulanan pengguna Moneyhist.",
};

// Guard auth ditangani `app/(app)/layout.tsx`.
export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Monthly Budget
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tentukan anggaran bulanan dan pantau penggunaannya.
        </p>
      </header>
      <BudgetView />
    </div>
  );
}
