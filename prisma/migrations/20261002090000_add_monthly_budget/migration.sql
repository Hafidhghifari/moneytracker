CREATE TABLE "monthly_budgets" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_budgets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "monthly_budgets_year_check" CHECK ("year" BETWEEN 1 AND 9999),
    CONSTRAINT "monthly_budgets_month_check" CHECK ("month" BETWEEN 1 AND 12),
    CONSTRAINT "monthly_budgets_amount_check" CHECK ("amount" > 0)
);

CREATE UNIQUE INDEX "monthly_budgets_user_id_year_month_key"
ON "monthly_budgets"("user_id", "year", "month");

ALTER TABLE "monthly_budgets"
ADD CONSTRAINT "monthly_budgets_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
