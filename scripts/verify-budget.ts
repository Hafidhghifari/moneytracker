import {
  monthSchema,
  parseMonth,
  toMonthKey,
  upsertBudgetSchema,
} from "../lib/budget/schema";

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
  // --- 1. Validasi schema bulan -------------------------------------
  check("monthSchema menerima 2026-10", monthSchema.safeParse("2026-10").success);

  for (const bad of ["2026-13", "2026-00", "2026-1", "26-10", "", "2026/10"]) {
    check(`monthSchema menolak "${bad}"`, !monthSchema.safeParse(bad).success);
  }

  check(
    "parseMonth memecah 2026-10",
    JSON.stringify(parseMonth("2026-10")) === JSON.stringify({ year: 2026, month: 10 }),
  );
  check("parseMonth menolak input salah", parseMonth("2026-13") === null);
  check(
    "toMonthKey memberi bulan 2 digit",
    toMonthKey({ year: 2026, month: 1 }) === "2026-01",
  );

  // --- 2. Validasi input Set Budget ---------------------------------
  const upsertOk = upsertBudgetSchema.safeParse({
    month: "2026-10",
    amount: 2000000,
  });
  check(
    "upsertBudgetSchema menerima nominal valid",
    upsertOk.success && upsertOk.data.amount === 2000000,
  );

  for (const amount of [0, -5, Number.NaN]) {
    check(
      `upsertBudgetSchema menolak amount ${String(amount)}`,
      !upsertBudgetSchema.safeParse({ month: "2026-10", amount }).success,
    );
  }

  check(
    "upsertBudgetSchema menolak bulan salah",
    !upsertBudgetSchema.safeParse({ month: "2026-13", amount: 1000 }).success,
  );
}

main()
  .catch((error) => {
    failures.push(`unhandled error: ${String(error)}`);
    console.error(error);
  })
  .then(() => {
    console.log(`\n${passed} ok, ${failures.length} gagal`);
    if (failures.length > 0) {
      process.exitCode = 1;
    }
  });
