"use client";

import { useEffect, useState } from "react";
import { AmountKeypad } from "@/components/dashboard/AmountKeypad";
import { toInputDate } from "@/lib/dashboard/format";
import { createTransaction } from "@/lib/dashboard/transactions";
import type {
  Transaction,
  TransactionType,
} from "@/lib/dashboard/types";

interface AddTransactionFormProps {
  /** id user dari session — diteruskan ke `createTransaction`. */
  userId: string;
  open: boolean;
  onClose: () => void;
  /** Dipanggil dengan transaksi yang baru tersimpan. */
  onSuccess: (transaction: Transaction) => void;
  onError: (message: string) => void;
}

/**
 * Dialog tambah transaksi (FR-07). Validasi dekat field, cegah submit
 * ganda saat menyimpan (DESIGN.md "Disabled/submitting"), Escape
 * menutup dialog dan fokus dikembalikan ke pemicu oleh pemanggil.
 */
export function AddTransactionForm({
  userId,
  open,
  onClose,
  onSuccess,
  onError,
}: AddTransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(toInputDate());
  const [fieldErrors, setFieldErrors] = useState<{
    amount?: string;
    description?: string;
    date?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const resetForm = () => {
    setType("expense");
    setAmount(0);
    setDescription("");
    setDate(toInputDate());
    setFieldErrors({});
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const errors: typeof fieldErrors = {};
    if (amount <= 0) errors.amount = "Nominal harus lebih dari Rp 0.";
    if (!description.trim()) errors.description = "Deskripsi wajib diisi.";
    if (!date) errors.date = "Tanggal wajib diisi.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await createTransaction(userId, {
        type,
        amount,
        description: description.trim(),
        date,
      });
      resetForm();
      onSuccess(created);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Gagal menyimpan transaksi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-transaction-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-transaction-title" className="text-lg font-semibold">
              Tambah transaksi
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Catat pemasukan atau pengeluaran ke akunmu.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Tutup form tambah transaksi"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] transition-colors hover:bg-surface-muted disabled:opacity-50"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
          <fieldset>
            <legend className="text-sm font-medium">Jenis transaksi</legend>
            <div role="radiogroup" aria-label="Jenis transaksi" className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  { value: "income", label: "Pemasukan" },
                  { value: "expense", label: "Pengeluaran" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={type === option.value}
                  onClick={() => setType(option.value)}
                  className={`inline-flex h-11 items-center justify-center rounded-[10px] border text-sm font-semibold transition-colors ${
                    type === option.value
                      ? option.value === "income"
                        ? "border-income bg-surface-muted text-income"
                        : "border-expense bg-surface-muted text-expense"
                      : "border-border bg-surface text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="nominal" className="text-sm font-medium">
              Nominal
            </label>
            <p id="nominal-help" className="mt-1 text-xs text-muted-foreground">
              Ketuk angka pada keypad atau ketik lewat keyboard fisik.
            </p>
            <div className="mt-2">
              <AmountKeypad
                value={amount}
                onChange={setAmount}
                onConfirm={() => {
                  document
                    .getElementById("transaction-description")
                    ?.focus();
                }}
              />
            </div>
            {fieldErrors.amount && (
              <p role="alert" className="mt-1 text-xs font-medium text-expense">
                {fieldErrors.amount}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="transaction-description"
              className="text-sm font-medium"
            >
              Deskripsi
            </label>
            <input
              id="transaction-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Contoh: Uang saku bulanan"
              maxLength={120}
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={
                fieldErrors.description ? "description-error" : undefined
              }
              className="mt-2 flex h-11 w-full items-center rounded-[10px] border border-border bg-surface px-4 text-sm placeholder:text-muted-foreground"
            />
            {fieldErrors.description && (
              <p
                id="description-error"
                role="alert"
                className="mt-1 text-xs font-medium text-expense"
              >
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="transaction-date" className="text-sm font-medium">
              Tanggal
            </label>
            <input
              id="transaction-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={Boolean(fieldErrors.date)}
              aria-describedby={fieldErrors.date ? "date-error" : undefined}
              className="mt-2 flex h-11 w-full items-center rounded-[10px] border border-border bg-surface px-4 text-sm"
            />
            {fieldErrors.date && (
              <p
                id="date-error"
                role="alert"
                className="mt-1 text-xs font-medium text-expense"
              >
                {fieldErrors.date}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            aria-disabled={submitting}
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Menyimpan…" : "Simpan transaksi"}
          </button>
        </form>
      </div>
    </div>
  );
}
