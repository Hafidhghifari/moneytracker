import { FinancialSummarySkeleton } from "@/components/dashboard/FinancialSummary";
import { RecentTransactionsSkeleton } from "@/components/dashboard/RecentTransactions";

/**
 * Loading UI segmen `/dashboard` — otomatis dibungkus `<Suspense>`
 * oleh App Router dan tampil selama Server Component mengambil session.
 * Skeleton di level komponen (saat fetch transaksi) ditangani oleh
 * `DashboardContent`.
 */
export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <div className="flex flex-col gap-8">
        <FinancialSummarySkeleton />
        <RecentTransactionsSkeleton />
      </div>
    </main>
  );
}
