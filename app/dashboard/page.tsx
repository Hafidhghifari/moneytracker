import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { MoneyhistLogo } from "@/components/brand/MoneyhistLogo";
import { MoneyCatMascot } from "@/components/brand/MoneyCatMascot";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="dashboard-gate">
      <section className="dashboard-gate-card">
        <div className="dashboard-gate-content">
          <div className="dashboard-gate-copy">
            <MoneyhistLogo href="/dashboard" />
            <p className="eyebrow" style={{ marginTop: 36 }}>Akun kamu</p>
            <h1>Halo, {user.name}.</h1>
            <p>Kamu berhasil masuk. Ringkasan transaksi akan muncul di sini setelah fitur transaksi tersedia.</p>
            <div className="dashboard-gate-actions">
              <Link href="/dashboard">Dashboard</Link>
              <LogoutButton />
            </div>
          </div>
          <MoneyCatMascot className="dashboard-mascot" />
        </div>
      </section>
    </main>
  );
}
