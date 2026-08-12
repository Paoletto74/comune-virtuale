CREATE TABLE IF NOT EXISTS "citizen_economic_accounts" (
  "citizen_id" text PRIMARY KEY REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "currency_id" text NOT NULL DEFAULT 'game_currency',
  "balance_minor" bigint NOT NULL CHECK ("balance_minor" >= 0),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "economic_transactions" (
  "transaction_id" text PRIMARY KEY,
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "currency_id" text NOT NULL,
  "amount_minor" bigint NOT NULL CHECK ("amount_minor" > 0),
  "direction" text NOT NULL CHECK ("direction" IN ('credit', 'debit')),
  "transaction_type" text NOT NULL,
  "transaction_class" text NOT NULL,
  "reason_code" text NOT NULL,
  "source_action_id" text NOT NULL,
  "idempotency_key" text NOT NULL UNIQUE,
  "status" text NOT NULL DEFAULT 'completed',
  "world_time_ms" bigint,
  "correlation_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "economic_transactions_citizen_created_idx"
  ON "economic_transactions" ("citizen_id", "created_at" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "economic_transactions_source_reason_unique_idx"
  ON "economic_transactions" ("source_action_id", "transaction_type", "reason_code");
