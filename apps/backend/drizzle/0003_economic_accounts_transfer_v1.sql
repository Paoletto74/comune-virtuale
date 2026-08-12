-- B.2-A: owner-agnostic economic accounts + bilateral transfer ledger

CREATE TABLE IF NOT EXISTS "npcs" (
  "npc_id" text PRIMARY KEY,
  "display_name" text,
  "age_category" text,
  "zone_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "economic_accounts" (
  "account_id" text PRIMARY KEY,
  "owner_type" text NOT NULL CHECK ("owner_type" IN ('citizen', 'npc', 'system')),
  "owner_ref" text NOT NULL,
  "currency_id" text NOT NULL DEFAULT 'game_currency',
  "balance_minor" bigint NOT NULL CHECK ("balance_minor" >= 0),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "economic_accounts_owner_currency_unique" UNIQUE ("owner_type", "owner_ref", "currency_id")
);

CREATE TABLE IF NOT EXISTS "economic_transfers" (
  "transfer_id" text PRIMARY KEY,
  "idempotency_key" text NOT NULL UNIQUE,
  "source_action_id" text NOT NULL,
  "reason_code" text NOT NULL,
  "transaction_type" text NOT NULL,
  "transaction_class" text NOT NULL,
  "amount_minor" bigint NOT NULL CHECK ("amount_minor" > 0),
  "currency_id" text NOT NULL,
  "status" text NOT NULL DEFAULT 'completed',
  "world_time_ms" bigint,
  "correlation_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "economic_transfers_source_reason_unique" UNIQUE ("source_action_id", "reason_code")
);

CREATE TABLE IF NOT EXISTS "economic_transfer_legs" (
  "leg_id" text PRIMARY KEY,
  "transfer_id" text NOT NULL REFERENCES "economic_transfers"("transfer_id") ON DELETE CASCADE,
  "account_id" text NOT NULL REFERENCES "economic_accounts"("account_id"),
  "direction" text NOT NULL CHECK ("direction" IN ('debit', 'credit')),
  "amount_minor" bigint NOT NULL CHECK ("amount_minor" > 0),
  "balance_after_minor" bigint NOT NULL CHECK ("balance_after_minor" >= 0)
);

CREATE INDEX IF NOT EXISTS "economic_transfer_legs_transfer_idx"
  ON "economic_transfer_legs" ("transfer_id");

CREATE INDEX IF NOT EXISTS "economic_transfer_legs_account_idx"
  ON "economic_transfer_legs" ("account_id");

-- Migrate citizen accounts
INSERT INTO "economic_accounts" ("account_id", "owner_type", "owner_ref", "currency_id", "balance_minor", "updated_at")
SELECT
  'citizen:' || "citizen_id",
  'citizen',
  "citizen_id",
  "currency_id",
  "balance_minor",
  "updated_at"
FROM "citizen_economic_accounts"
ON CONFLICT ("account_id") DO NOTHING;

-- System account for money_creation audit trail
INSERT INTO "economic_accounts" ("account_id", "owner_type", "owner_ref", "currency_id", "balance_minor", "updated_at")
VALUES ('system:game_currency', 'system', 'game_currency', 'game_currency', 0, now())
ON CONFLICT ("account_id") DO NOTHING;

-- Migrate legacy single-sided transactions into transfer + leg records
INSERT INTO "economic_transfers" (
  "transfer_id",
  "idempotency_key",
  "source_action_id",
  "reason_code",
  "transaction_type",
  "transaction_class",
  "amount_minor",
  "currency_id",
  "status",
  "world_time_ms",
  "correlation_id",
  "created_at"
)
SELECT
  "transaction_id",
  "idempotency_key",
  "source_action_id",
  "reason_code",
  "transaction_type",
  "transaction_class",
  "amount_minor",
  "currency_id",
  "status",
  "world_time_ms",
  "correlation_id",
  "created_at"
FROM "economic_transactions"
ON CONFLICT ("transfer_id") DO NOTHING;

INSERT INTO "economic_transfer_legs" ("leg_id", "transfer_id", "account_id", "direction", "amount_minor", "balance_after_minor")
SELECT
  "transaction_id" || ':leg',
  "transaction_id",
  'citizen:' || et."citizen_id",
  et."direction",
  et."amount_minor",
  ea."balance_minor"
FROM "economic_transactions" et
JOIN "economic_accounts" ea ON ea."account_id" = 'citizen:' || et."citizen_id"
ON CONFLICT ("leg_id") DO NOTHING;

ALTER TABLE "task_instances" ADD COLUMN IF NOT EXISTS "target_npc_id" text REFERENCES "npcs"("npc_id");
ALTER TABLE "task_instances" ADD COLUMN IF NOT EXISTS "context" jsonb NOT NULL DEFAULT '{}'::jsonb;

DROP TABLE IF EXISTS "economic_transactions";
DROP TABLE IF EXISTS "citizen_economic_accounts";
