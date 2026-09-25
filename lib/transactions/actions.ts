"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUserId } from "../auth";
import { createTransaction, deleteTransaction } from "./data";
import {
  deleteTransactionSchema,
  transactionInputSchema,
} from "./schema";

const TRANSACTIONS_PATH = "/transactions";
const DASHBOARD_PATH = "/dashboard";
const NOT_FOUND_MESSAGE = "Transaksi tidak ditemukan atau bukan milikmu";

export type ActionState =
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<string, string[]>>;
    };

function fieldErrorsFrom(
  error: z.ZodError,
): Partial<Record<string, string[]>> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }

  return fieldErrors;
}

export async function addTransactionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await getCurrentUserId();

  if (userId == null) {
    redirect("/login");
  }

  const parsed = transactionInputSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    transactionDate: formData.get("transactionDate"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Data transaksi tidak valid",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await createTransaction(userId, parsed.data);
  } catch (error) {
    console.error("Gagal menyimpan transaksi:", error);
    return {
      status: "error",
      message: "Gagal menyimpan transaksi. Coba lagi.",
    };
  }

  revalidatePath(TRANSACTIONS_PATH);
  revalidatePath(DASHBOARD_PATH);

  return { status: "success", message: "Transaksi berhasil disimpan." };
}

export async function deleteTransactionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await getCurrentUserId();

  if (userId == null) {
    redirect("/login");
  }

  const parsed = deleteTransactionSchema.safeParse({
    transactionId: formData.get("transactionId"),
  });

  if (!parsed.success) {
    return { status: "error", message: NOT_FOUND_MESSAGE };
  }

  try {
    const deleted = await deleteTransaction(userId, parsed.data.transactionId);

    if (!deleted) {
      return { status: "error", message: NOT_FOUND_MESSAGE };
    }
  } catch (error) {
    console.error("Gagal menghapus transaksi:", error);
    return {
      status: "error",
      message: "Gagal menghapus transaksi. Coba lagi.",
    };
  }

  revalidatePath(TRANSACTIONS_PATH);
  revalidatePath(DASHBOARD_PATH);

  return { status: "success", message: "Transaksi berhasil dihapus." };
}
