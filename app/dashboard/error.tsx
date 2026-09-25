'use client';

import { useEffect } from "react";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  // Next.js 16: prop pemulihan error boundary bernama `retry`.
  retry: () => void;
}

/**
 * Error boundary segmen `/dashboard` — tampil bila Server Component
 * (mis. pengambilan session) gagal. Error saat fetch transaksi di sisi
 * klien ditangani terpisah oleh `DashboardContent` (pesan + tombol retry).
 */
export default function DashboardError({ error, retry }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <div
        role="alert"
        className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950/40"
      >
        <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-300">
          Terjadi kesalahan pada halaman dashboard
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-rose-600 dark:text-rose-400">
          Coba muat ulang halaman. Jika masalah berlanjut, hubungi tim
          pengembang.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-rose-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
        >
          Coba lagi
        </button>
      </div>
    </main>
  );
}
