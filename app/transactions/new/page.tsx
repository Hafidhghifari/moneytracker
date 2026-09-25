import type { Metadata } from "next";
import { MoneyhistLogo } from "@/components/brand/MoneyhistLogo";
import { MoneyCatMascot } from "@/components/brand/MoneyCatMascot";
import { TransactionForm } from "@/components/transactions/transaction-form";

export const metadata: Metadata = {
  title: "Tambah Transaksi",
};

export default function NewTransactionPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch">
      <aside className="relative hidden flex-col overflow-hidden rounded-3xl border border-[#dce5f0] bg-[radial-gradient(ellipse_at_80%_8%,#e1eafa_0,transparent_46%),linear-gradient(150deg,#f2f6fc,#e9eff8_72%,#e3ebf6)] p-8 lg:flex xl:p-10">
        <MoneyhistLogo href="/transactions" />

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="w-52 xl:w-60">
            <MoneyCatMascot />
          </div>
          <h2 className="mt-7 text-2xl font-semibold tracking-tight text-[#172b32]">
            Keluar masuk uang,
            <br />
            keingat semua.
          </h2>
        </div>
      </aside>

      <div className="flex w-full justify-center">
        <div className="w-full max-w-xl">
          <TransactionForm />
        </div>
      </div>
    </div>
  );
}