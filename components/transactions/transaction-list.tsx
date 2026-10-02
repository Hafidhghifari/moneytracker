"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Inbox, Plus, RotateCw, Trash2 } from "lucide-react";
import { Button, ButtonLink, IconButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { TransactionTypeIcon, TypePill } from "@/components/ui/transaction-type";
import { TransactionFilterControl } from "./transaction-filter";
import type { TransactionFilter } from "./transaction-filter";
import {
  deleteTransaction,
  getTransactions,
  messageOfError,
  TRANSACTION_TYPE_LABEL,
} from "@/lib/transactions";
import type { Transaction } from "@/lib/transactions";
import { formatCurrency, formatDate, sortableDate } from "@/lib/format";

type LoadState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; message: string };

function sortTransactions(list: Transaction[]): Transaction[] {
  return [...list].sort(
    (a, b) =>
      sortableDate(b.transaction_date).localeCompare(sortableDate(a.transaction_date)) ||
      String(b.id).localeCompare(String(a.id))
  );
}

export function TransactionHistory() {
  const toast = useToast();
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  function applySuccess(list: Transaction[]) {
    setTransactions(sortTransactions(list));
    setLoadState({ status: "ready" });
  }

  function applyError(error: unknown) {
    setLoadState({ status: "error", message: messageOfError(error) });
  }

  useEffect(() => {
    let cancelled = false;
    getTransactions()
      .then((list) => {
        if (cancelled) return;
        applySuccess(list);
      })
      .catch((error) => {
        if (cancelled) return;
        applyError(error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function retry() {
    setLoadState({ status: "loading" });
    getTransactions()
      .then((list) => applySuccess(list))
      .catch((error) => applyError(error));
  }

  const filtered = useMemo(
    () =>
      filter === "all"
        ? transactions
        : transactions.filter((item) => item.type === filter),
    [transactions, filter]
  );

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setDeleting(true);
    try {
      await deleteTransaction(target.id);
      setTransactions((list) => list.filter((item) => item.id !== target.id));
      setPendingDelete(null);
      toast.success("Transaksi berhasil dihapus.");
    } catch (error) {
      setPendingDelete(null);
      toast.error(`Transaksi gagal dihapus. ${messageOfError(error)}`);
    } finally {
      setDeleting(false);
    }
  }

  const filterLabel =
    filter === "income"
      ? TRANSACTION_TYPE_LABEL.income
      : filter === "expense"
        ? TRANSACTION_TYPE_LABEL.expense
        : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Riwayat transaksi
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola dan periksa catatan pemasukan serta pengeluaranmu.
          </p>
        </div>
        <ButtonLink href="/transactions/new">
          <Plus className="size-4" aria-hidden="true" />
          Tambah transaksi
        </ButtonLink>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TransactionFilterControl
          value={filter}
          onChange={setFilter}
          transactions={transactions}
        />
        <p className="text-sm text-muted-foreground">
          {loadState.status === "ready" ? (
            <span className="tabular-nums">
              Menampilkan {filtered.length} dari {transactions.length} transaksi
            </span>
          ) : (
            <span className="tabular-nums">Menyiapkan riwayat…</span>
          )}
        </p>
      </div>

      <Panel>
        {loadState.status === "loading" ? <LoadingRows /> : null}

        {loadState.status === "error" ? (
          <ErrorState message={loadState.message} onRetry={retry} />
        ) : null}

        {loadState.status === "ready" && transactions.length === 0 ? (
          <EmptyState />
        ) : null}

        {loadState.status === "ready" &&
        transactions.length > 0 &&
        filtered.length === 0 ? (
          <EmptyFilteredState filterLabel={filterLabel} />
        ) : null}

        {loadState.status === "ready" && filtered.length > 0 ? (
          <div className="divide-y divide-border">
            {filtered.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onDelete={() => setPendingDelete(transaction)}
              />
            ))}
          </div>
        ) : null}
      </Panel>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Hapus transaksi?"
        description={
          pendingDelete ? (
            <>
              Transaksi{" "}
              <strong className="font-semibold text-foreground">
                “{pendingDelete.description || "Tanpa deskripsi"}”
              </strong>{" "}
              sebesar {formatCurrency(pendingDelete.amount)} akan dihapus
              permanen. Tindakan ini tidak dapat dibatalkan.
            </>
          ) : null
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}

function TransactionRow({
  transaction,
  onDelete,
}: {
  transaction: Transaction;
  onDelete: () => void;
}) {
  const isIncome = transaction.type === "income";
  return (
    <div className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-muted/40 md:px-5">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
          isIncome ? "bg-income/10" : "bg-expense/10"
        }`}
      >
        <TransactionTypeIcon type={transaction.type} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-foreground">
          {transaction.description || "Tanpa deskripsi"}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
          <time dateTime={sortableDate(transaction.transaction_date)}>
            {formatDate(transaction.transaction_date)}
          </time>
          <TypePill type={transaction.type} />
        </p>
      </div>
      <p
        className={`shrink-0 text-[15px] font-semibold tabular-nums ${
          isIncome ? "text-income" : "text-expense"
        }`}
      >
        {isIncome ? "+" : "−"}
        {formatCurrency(transaction.amount)}
      </p>
      <IconButton
        label={`Hapus transaksi ${transaction.description || "tanpa deskripsi"}`}
        onClick={onDelete}
        className="text-muted-foreground opacity-70 hover:bg-expense/10 hover:text-expense hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        <Trash2 className="size-[18px]" aria-hidden="true" />
      </IconButton>
    </div>
  );
}

function LoadingRows() {
  return (
    <div aria-hidden="true" className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-4 md:px-5">
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-surface-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
          </div>
          <div className="h-4 w-24 shrink-0 animate-pulse rounded bg-surface-muted" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-surface-muted">
        <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        Belum ada transaksi
      </h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Catat pemasukan atau pengeluaran pertamamu untuk mulai melihat riwayat
        dan kondisi keuanganmu.
      </p>
      <ButtonLink href="/transactions/new" className="mt-5">
        <Plus className="size-4" aria-hidden="true" />
        Tambah transaksi
      </ButtonLink>
    </div>
  );
}

function EmptyFilteredState({ filterLabel }: { filterLabel: string | null }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-surface-muted">
        <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        Tidak ada transaksi {filterLabel?.toLowerCase()}
      </h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Belum ada catatan berjenis {filterLabel?.toLowerCase()}. Pilih filter
        Semua untuk melihat seluruh transaksimu.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-expense/10">
        <AlertCircle className="size-8 text-expense" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        Tidak dapat memuat transaksi
      </h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" onClick={onRetry}>
          <RotateCw className="size-4" aria-hidden="true" />
          Coba lagi
        </Button>
        <ButtonLink href="/transactions/new" variant="ghost">
          <Plus className="size-4" aria-hidden="true" />
          Tambah transaksi
        </ButtonLink>
      </div>
    </div>
  );
}