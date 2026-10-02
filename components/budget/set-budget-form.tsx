"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { upsertBudgetSchema } from "@/lib/budget/schema";
import { digitsToNumber, formatCurrency } from "@/lib/format";

function messageOfPayload(payload: unknown): string | null {
  if (payload && typeof payload === "object" && "message" in payload) {
    const value = (payload as { message?: unknown }).message;
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

export function SetBudgetForm({
  month,
  currentAmount,
  onSaved,
}: {
  month: string;
  currentAmount: number;
  onSaved: () => void;
}) {
  const [input, setInput] = useState(
    currentAmount > 0 ? String(Math.trunc(currentAmount)) : "",
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = digitsToNumber(input);
    if (!Number.isFinite(amount)) {
      setMessage("Nominal anggaran wajib diisi.");
      return;
    }

    const parsed = upsertBudgetSchema.safeParse({ month, amount });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Nominal tidak valid.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(messageOfPayload(payload) ?? "Gagal menyimpan anggaran.");
      }
      onSaved();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal menyimpan anggaran.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel className="p-5">
      <h3 className="text-lg font-semibold text-foreground">Set Budget</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Anggaran untuk {month}.{" "}
        {currentAmount > 0
          ? `Saat ini ${formatCurrency(currentAmount)}.`
          : "Belum ditentukan."}
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Nominal anggaran (Rp)</span>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            inputMode="numeric"
            placeholder="2000000"
            className="h-11 w-52 rounded-[10px] border border-border bg-surface px-3 text-sm tabular-nums text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
        <Button type="submit" disabled={saving}>
          {saving ? "Menyimpan…" : "Simpan Budget"}
        </Button>
      </form>
      {message ? <p className="mt-3 text-sm text-expense">{message}</p> : null}
    </Panel>
  );
}
