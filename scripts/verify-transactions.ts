import "dotenv/config";
import {
  transactionFilterSchema,
  transactionInputSchema,
} from "../lib/transactions/schema";

// Pembacaan kolom @db.Date harus deterministik di mesin mana pun.
process.env.TZ = "UTC";

let passed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    passed += 1;
    console.log(`  ok  ${name}`);
    return;
  }

  failures.push(detail ? `${name} — ${detail}` : name);
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main(): Promise<void> {
  // --- 1. Validasi schema -------------------------------------------
  const valid = transactionInputSchema.safeParse({
    type: "expense",
    amount: "25000.50",
    description: "Makan siang",
    transactionDate: "2026-09-02",
  });
  check(
    "amount desimal valid diterima",
    valid.success && valid.data.amount === 25000.5,
  );

  for (const amount of ["0", "-5", "12.345", "abc", ""]) {
    const result = transactionInputSchema.safeParse({
      type: "income",
      amount,
      description: "Tes",
      transactionDate: "2026-09-01",
    });
    check(`amount "${amount}" ditolak`, !result.success);
  }

  for (const transactionDate of ["2026-02-31", "2026-9-1", "01-09-2026", ""]) {
    const result = transactionInputSchema.safeParse({
      type: "income",
      amount: "1000",
      description: "Tes",
      transactionDate,
    });
    check(`tanggal "${transactionDate}" ditolak`, !result.success);
  }

  const emptyDescription = transactionInputSchema.safeParse({
    type: "income",
    amount: "1000",
    description: "   ",
    transactionDate: "2026-09-01",
  });
  check("deskripsi kosong ditolak", !emptyDescription.success);

  const badType = transactionInputSchema.safeParse({
    type: "transfer",
    amount: "1000",
    description: "Tes",
    transactionDate: "2026-09-01",
  });
  check("type di luar income/expense ditolak", !badType.success);

  check(
    "filter tidak dikenal jatuh ke all",
    transactionFilterSchema.parse("xyz") === "all",
  );
  check(
    "filter income dipertahankan",
    transactionFilterSchema.parse("income") === "income",
  );
}

main().then(() => {
  console.log(`\n${passed} ok, ${failures.length} gagal`);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
});
