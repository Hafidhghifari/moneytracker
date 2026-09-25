import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getCurrentUser } from "@/lib/auth/session";
import { getTransactionsByUserId } from "@/lib/dashboard/transactions-server";

export const metadata = {
  title: "Dashboard — Moneyhist",
  description:
    "Ringkasan keuangan dan transaksi terbaru pengguna Moneyhist.",
};

// Membaca session per request — jangan di-prerender statis.
export const dynamic = "force-dynamic";

/**
 * Halaman Dashboard (Server Component, FR-06 + FR-05 ayat 5).
 * Guard: belum login -> redirect `/login`. User dibaca dari
 * session auth — tanpa hardcode.
 * Fetch awal memakai `user.id` dari session, lalu interaksi
 * (periode, tambah transaksi) berjalan di `DashboardClient`.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const initialTransactions = await getTransactionsByUserId(user.id);

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
      <DashboardClient user={user} initialTransactions={initialTransactions} />
    </main>
  );
}
