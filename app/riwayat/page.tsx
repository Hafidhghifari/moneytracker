import Link from "next/link";

export const metadata = {
  title: "Riwayat Transaksi — Moneyhist",
  description: "Riwayat lengkap transaksi pengguna Moneyhist.",
};

/**
 * PLACEHOLDER route riwayat lengkap — tujuan link "Lihat semua" di
 * dashboard. Milik Anggota 4 (Transaction UI & Filter): silakan timpa
 * file ini dengan halaman riwayat + filter Semua/Pemasukan/Pengeluaran
 * (SRS FR-08, FR-09).
 */
export default function RiwayatPlaceholderPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">
        Riwayat transaksi
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Halaman riwayat lengkap sedang dikerjakan oleh Anggota 4 (bagian
        Transaction UI &amp; Filter), termasuk filter Semua, Pemasukan,
        dan Pengeluaran.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-[10px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
      >
        Kembali ke dashboard
      </Link>
    </main>
  );
}
