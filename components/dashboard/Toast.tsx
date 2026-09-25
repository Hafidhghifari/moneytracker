"use client";

import { useEffect } from "react";

export interface ToastData {
  kind: "success" | "error";
  message: string;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

/**
 * Toast umpan balik kontekstual (DESIGN.md "Notifikasi dan pesan
 * aktivitas"): sukses tambah, gagal simpan, sesi berakhir. Sukses
 * hilang otomatis; error menetap sampai ditutup pengguna.
 */
export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast || toast.kind !== "success") return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.kind === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live="polite"
      className={`fixed bottom-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl border p-4 shadow-sm ${
        isSuccess
          ? "border-income bg-surface text-foreground"
          : "border-expense bg-surface text-foreground"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isSuccess
            ? "bg-surface-muted text-income"
            : "bg-surface-muted text-expense"
        }`}
      >
        {isSuccess ? "✓" : "!"}
      </span>
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-colors hover:bg-surface-muted"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
