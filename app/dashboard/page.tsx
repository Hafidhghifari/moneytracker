import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { getCurrentUser } from "@/lib/dashboard/session";

export const metadata = {
  title: "Dashboard — Moneyhist",
  description: "Ringkasan keuangan dan transaksi terbaru pengguna.",
};

// Halaman membaca session per request, jadi jangan di-prerender statis.
export const dynamic = "force-dynamic";

/**
 * Halaman Dashboard (Server Component).
 *
 * - Hanya bisa diakses setelah login: bila `getCurrentUser()` (session
 *   milik Anggota 1) mengembalikan null, redirect ke `/login`.
 * - Tidak ada hardcode user_id — `DashboardContent` menerima user dari
 *   session dan mengambil transaksi berdasarkan `user.id`.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <DashboardContent user={user} />
    </main>
  );
}
