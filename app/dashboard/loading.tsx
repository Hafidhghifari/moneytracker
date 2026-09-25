import { FinancialSummarySkeleton } from "@/components/dashboard/FinancialSummary";
import { RecentTransactionsSkeleton } from "@/components/dashboard/RecentTransactions";

/**
 * Loading segmen `/dashboard` — skeleton menjaga dimensi layout akhir
 * (DESIGN.md "Loading") selama Server Component mengambil session/data.
 */
export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-6 sm:gap-8">
        <FinancialSummarySkeleton />
        <div
          aria-hidden="true"
          className="h-[60px] animate-pulse rounded-2xl border border-border bg-surface"
        />
        <RecentTransactionsSkeleton />
      </div>
    </main>
  );
}
