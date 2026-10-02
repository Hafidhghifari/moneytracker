import type { Transaction } from "../dashboard/types";
import type { TransactionDTO } from "./data";

/**
 * Bentuk transaksi yang dikirim ke UI. `user_id` selalu berasal dari session
 * di server (bukan dari client) sehingga tidak dapat dipalsukan.
 */
export function toWireTransaction(
  dto: TransactionDTO,
  userId: number,
): Transaction {
  return {
    id: String(dto.id),
    user_id: String(userId),
    type: dto.type,
    amount: dto.amount,
    description: dto.description,
    date: dto.transactionDate,
  };
}
