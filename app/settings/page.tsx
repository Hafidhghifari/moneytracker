import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { TransactionPreference } from "@/components/auth/TransactionPreference";
import { MoneyhistLogo } from "@/components/brand/MoneyhistLogo";
import { getCurrentUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="dashboard-gate">
      <section className="settings-card">
        <MoneyhistLogo href="/dashboard" />
        <p className="eyebrow" style={{ marginTop: 36 }}>Preferensi akun</p>
        <h1>Pengaturan</h1>
        <p className="settings-intro">Hai {user.name}, atur pilihan tampilan transaksi untuk akunmu.</p>
        <TransactionPreference initialValue={user.preference} />
        <div className="dashboard-gate-actions">
          <Link href="/dashboard">Kembali ke dashboard</Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
