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
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold sm:text-3xl">
        Riwayat transaksi
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Riwayat lengkap kini tersedia di halaman Transaksi, lengkap dengan
        filter Semua, Pemasukan, dan Pengeluaran.
      </p>
      <Link
        href="/transactions"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-[10px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
      >
        Buka halaman transaksi
      </Link>
    </div>
  );
}
