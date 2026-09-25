import type { Metadata } from "next";
import { TransactionHistory } from "@/components/transactions/transaction-list";

export const metadata: Metadata = {
  title: "Riwayat Transaksi",
};

export default function TransactionsPage() {
  return <TransactionHistory />;
}