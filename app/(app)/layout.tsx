import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Layout untuk semua halaman bertema aplikasi (setelah login):
 * dashboard, transaksi, riwayat, dan pengaturan.
 *
 * `AppShell` memasang sidebar navigasi + topbar agar konsisten di
 * seluruh halaman. User dari session dioper ke shell untuk menu
 * profil (nama akun + logout). Halaman autentikasi (login/register)
 * berada di luar route group ini sehingga tidak memakai shell.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <AppShell user={user}>{children}</AppShell>;
}
