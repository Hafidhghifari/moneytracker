import Link from "next/link";

export const metadata = {
  title: "Login — Moneyhist",
  description: "Masuk ke akun Moneyhist.",
};

/**
 * PLACEHOLDER — halaman login milik Anggota 1 (auth).
 *
 * File ini hanya penanda target redirect `/login` agar halaman dashboard
 * yang belum login punya tujuan yang valid. Seluruh logika login/session
 * tetap dikerjakan Anggota 1 — silakan timpa file ini dengan implementasi
 * aslinya.
 */
export default function LoginPlaceholderPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Login Moneyhist
      </h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Halaman login sedang dikerjakan oleh Anggota 1 (bagian auth). Kamu
        diarahkan ke sini karena belum login.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Kembali ke Dashboard
      </Link>
    </main>
  );
}
