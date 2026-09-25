"use client";

import { useState } from "react";

type Preference = "all" | "income" | "expense";

const labels: Record<Preference, string> = {
  all: "Semua transaksi",
  income: "Pemasukan",
  expense: "Pengeluaran",
};

export function TransactionPreference({ initialValue }: { initialValue: string }) {
  const [preference, setPreference] = useState<Preference>(
    initialValue === "income" || initialValue === "expense" ? initialValue : "all",
  );
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function save(nextPreference: Preference) {
    const previous = preference;
    setPreference(nextPreference);
    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference: nextPreference }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        setPreference(previous);
        setMessage(result.message ?? "Preferensi gagal disimpan.");
        return;
      }
      setMessage("Preferensi tersimpan.");
    } catch {
      setPreference(previous);
      setMessage("Tidak dapat terhubung. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="preference-field">
      <label htmlFor="transaction-preference">Filter transaksi pilihan</label>
      <select
        disabled={pending}
        id="transaction-preference"
        onChange={(event) => void save(event.target.value as Preference)}
        value={preference}
      >
        {Object.entries(labels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <p aria-live="polite" className="preference-message">{pending ? "Menyimpan…" : message}</p>
    </div>
  );
}
