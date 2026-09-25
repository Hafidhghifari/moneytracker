"use client";

import { useEffect } from "react";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary segmen `/dashboard` (DESIGN.md "Error"): pesan jelas
 * + tombol coba lagi. Error runtime client (refetch) ditangani inline
 * oleh `DashboardClient`; boundary ini menangkap kegagalan render
 * Server Component (mis. session/fetch awal).
 */
export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
      <div
        role="alert"
        className="rounded-2xl border border-expense bg-surface p-8 text-center"
      >
        <h1 className="text-lg font-semibold text-expense">
          Terjadi kesalahan pada halaman dashboard
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Data tidak dapat dimuat. Periksa koneksi internetmu lalu coba
          lagi. Jika masalah berlanjut, masuk kembali atau hubungi tim
          pengembang.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-[10px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Coba lagi
        </button>
      </div>
    </main>
  );
}
