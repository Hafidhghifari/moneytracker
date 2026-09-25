import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="dashboard-gate">
      <section className="dashboard-gate-card">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark" aria-hidden="true">mh</span>
          <span className="brand-name">moneyhist</span>
        </Link>
        <p className="eyebrow" style={{ marginTop: 36 }}>Akun kamu</p>
        <h1>Halo, {user.name}.</h1>
        <p>Kamu berhasil masuk. Ringkasan transaksi akan muncul di sini setelah fitur transaksi tersedia.</p>
        <div className="dashboard-gate-actions">
          <Link href="/dashboard">Dashboard</Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
