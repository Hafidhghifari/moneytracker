"use client";

import { useEffect } from "react";
import { formatRupiah } from "@/lib/dashboard/format";

interface AmountKeypadProps {
  /** Nominal saat ini dalam Rupiah (bilangan bulat). */
  value: number;
  onChange: (value: number) => void;
  /** Dipanggil saat tombol konfirmasi / Enter keyboard ditekan. */
  onConfirm?: () => void;
  id?: string;
}

const MAX_DIGITS = 12;

/**
 * Keypad angka custom untuk input nominal. Tampilan besar tabular-nums
 * di atas; tombol 0–9, hapus satu digit, dan konfirmasi. Keyboard fisik
 * tetap bisa dipakai (angka, Backspace, Enter) via listener keydown.
 */
export function AmountKeypad({
  value,
  onChange,
  onConfirm,
  id = "nominal",
}: AmountKeypadProps) {
  const appendDigit = (digit: string) => {
    const current = String(value);
    const next = current === "0" ? digit : current + digit;
    if (next.replace(/\D/g, "").length > MAX_DIGITS) return;
    const parsed = Number(next);
    if (Number.isSafeInteger(parsed)) onChange(parsed);
  };

  const backspace = () => {
    onChange(Math.floor(value / 10));
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // Abaikan bila fokus sedang di field teks lain (deskripsi/tanggal).
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
        target.id !== id
      ) {
        return;
      }
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        appendDigit(event.key);
      } else if (event.key === "Backspace" && target?.id === id) {
        event.preventDefault();
        backspace();
      } else if (event.key === "Enter") {
        event.preventDefault();
        onConfirm?.();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, onConfirm, id]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <div>
      <output
        htmlFor={id}
        aria-live="polite"
        className="tnum block rounded-[10px] border border-border bg-surface-muted px-4 py-3 text-center text-[28px] font-medium"
      >
        {formatRupiah(value)}
      </output>
      {/* Input tersembunyi agar screen reader & keyboard fisik punya target fokus yang jelas. */}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value === 0 ? "" : String(value)}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, MAX_DIGITS);
          onChange(digits ? Number(digits) : 0);
        }}
        placeholder="0"
        aria-label="Nominal dalam Rupiah"
        className="sr-only"
        tabIndex={-1}
      />
      <div
        role="group"
        aria-label="Keypad angka nominal"
        className="mt-3 grid grid-cols-3 gap-2"
      >
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => appendDigit(key)}
            aria-label={`Angka ${key}`}
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-border bg-surface text-base font-semibold transition-colors hover:bg-surface-muted"
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          onClick={backspace}
          aria-label="Hapus satu digit"
          className="inline-flex h-11 items-center justify-center rounded-[10px] border border-border bg-surface text-sm font-semibold transition-colors hover:bg-surface-muted"
        >
          Hapus
        </button>
        <button
          type="button"
          onClick={() => onConfirm?.()}
          aria-label="Konfirmasi nominal"
          className="col-span-2 inline-flex h-11 items-center justify-center rounded-[10px] bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Konfirmasi
        </button>
      </div>
    </div>
  );
}
