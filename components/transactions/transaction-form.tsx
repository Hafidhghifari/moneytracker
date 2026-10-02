"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowDownLeft, ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { useToast } from "@/components/ui/toast";
import {
  createTransaction,
  messageOfError,
} from "@/lib/transactions";
import type { TransactionType } from "@/lib/transactions";
import {
  digitsToNumber,
  formatInputAmount,
  todayIso,
} from "@/lib/format";

interface FormErrors {
  type?: string;
  amount?: string;
  description?: string;
  date?: string;
}

const MAX_AMOUNT = 999_999_999_999;

export function TransactionForm() {
  const router = useRouter();
  const toast = useToast();

  const [type, setType] = useState<TransactionType>("income");
  const [amountRaw, setAmountRaw] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIso());
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const amountRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  function clearError(field: keyof FormErrors) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleTypeChange(next: TransactionType) {
    setType(next);
    clearError("type");
    setServerError(null);
  }

  function handleAmountChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 15);
    setAmountRaw(digits ? formatInputAmount(digits) : "");
    if (errors.amount) clearError("amount");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const amount = digitsToNumber(amountRaw);
    const nextErrors: FormErrors = {};

    if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "Masukkan nominal lebih dari 0.";
    } else if (amount > MAX_AMOUNT) {
      nextErrors.amount = "Nominal terlalu besar.";
    }

    if (!description.trim()) {
      nextErrors.description = "Deskripsi wajib diisi.";
    }

    if (!date) {
      nextErrors.date = "Pilih tanggal transaksi.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.amount) {
        amountRef.current?.focus();
      } else if (nextErrors.description) {
        descriptionRef.current?.focus();
      } else if (nextErrors.date) {
        dateRef.current?.focus();
      }
      return;
    }

    setSubmitting(true);
    void (async () => {
      try {
        await createTransaction({
          type,
          amount,
          description: description.trim(),
          transaction_date: date,
        });
        toast.success("Transaksi berhasil ditambahkan.");
        router.push("/transactions");
      } catch (error) {
        const message = messageOfError(error);
        setServerError(message);
        toast.error(`Transaksi gagal ditambahkan. ${message}`);
        setSubmitting(false);
      }
    })();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke riwayat
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          Tambah transaksi
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Catat pemasukan atau pengeluaran baru.
        </p>
      </div>

      <Panel className="p-5 md:p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Jenis transaksi
            </span>
            <div
              role="radiogroup"
              aria-label="Jenis transaksi"
              className="grid grid-cols-2 gap-1 rounded-[10px] bg-surface-muted p-1"
            >
              <TypeOption
                active={type === "income"}
                onClick={() => handleTypeChange("income")}
                icon={ArrowDownLeft}
                label="Pemasukan"
                description="Uang masuk"
                toneActive="bg-surface text-income border-income/20"
                toneIcon="text-income"
              />
              <TypeOption
                active={type === "expense"}
                onClick={() => handleTypeChange("expense")}
                icon={ArrowUpRight}
                label="Pengeluaran"
                description="Uang keluar"
                toneActive="bg-surface text-expense border-expense/20"
                toneIcon="text-expense"
              />
            </div>
            {errors.type ? (
              <p role="alert" className="text-[13px] text-expense">
                {errors.type}
              </p>
            ) : null}
          </div>

          <Field
            ref={amountRef}
            label="Nominal"
            prefix="Rp"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={amountRaw}
            onChange={(event) => handleAmountChange(event.target.value)}
            error={errors.amount}
            help="Masukkan angka tanpa titik atau koma."
          />

          <Field
            ref={descriptionRef}
            label="Deskripsi"
            placeholder="Contoh: Gaji bulanan, belanja mingguan"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              if (errors.description) clearError("description");
            }}
            error={errors.description}
            maxLength={200}
          />

          <Field
            ref={dateRef}
            label="Tanggal transaksi"
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              if (errors.date) clearError("date");
            }}
            error={errors.date}
            help="Tanggal saat transaksi terjadi."
          />

          {serverError ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl bg-expense/10 px-4 py-3 text-sm leading-relaxed text-expense"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {serverError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <ButtonLink href="/transactions" variant="outline">
              Batal
            </ButtonLink>
            <Button type="submit" loading={submitting}>
              Simpan transaksi
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}

function TypeOption({
  active,
  onClick,
  icon: Icon,
  label,
  description,
  toneActive,
  toneIcon,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof ArrowDownLeft;
  label: string;
  description: string;
  toneActive: string;
  toneIcon: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={[
        "flex h-12 items-center gap-2.5 rounded-lg border px-3.5 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? `border bg-surface shadow-sm ${toneActive}`
          : "border-transparent text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      <Icon
        className={`size-5 shrink-0 ${active ? toneIcon : "text-muted-foreground"}`}
        aria-hidden="true"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}