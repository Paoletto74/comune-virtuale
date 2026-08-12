-- V1-GAME-SURFACE-MASTER-IMPLEMENTATION-1

CREATE TABLE IF NOT EXISTS "municipality_state" (
  "id" integer PRIMARY KEY DEFAULT 1,
  "treasury_minor" bigint NOT NULL DEFAULT 0,
  "inflation_rate_bps" integer NOT NULL DEFAULT 200,
  "citizen_count" integer NOT NULL DEFAULT 0,
  "updated_at_game_ms" bigint NOT NULL DEFAULT 0,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS "municipality_inflation_history" (
  "snapshot_id" text PRIMARY KEY,
  "recorded_at_game_ms" bigint NOT NULL,
  "inflation_rate_bps" integer NOT NULL,
  "treasury_minor" bigint NOT NULL,
  "idempotency_key" text NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS "municipality_inflation_history_recorded_idx"
  ON "municipality_inflation_history" ("recorded_at_game_ms" DESC);

CREATE TABLE IF NOT EXISTS "referendums" (
  "referendum_id" text PRIMARY KEY,
  "question" text NOT NULL,
  "context" text NOT NULL,
  "status" text NOT NULL,
  "option_a_label" text NOT NULL,
  "option_b_label" text NOT NULL,
  "option_a_votes" integer NOT NULL DEFAULT 0,
  "option_b_votes" integer NOT NULL DEFAULT 0,
  "starts_at_game_ms" bigint NOT NULL,
  "ends_at_game_ms" bigint NOT NULL,
  "closed_at_game_ms" bigint,
  "winning_option" text,
  "consequence_summary" text,
  "idempotency_key" text NOT NULL UNIQUE,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS "referendum_votes" (
  "vote_id" text PRIMARY KEY,
  "referendum_id" text NOT NULL REFERENCES "referendums"("referendum_id") ON DELETE CASCADE,
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "option_id" text NOT NULL,
  "voted_at_game_ms" bigint NOT NULL,
  "idempotency_key" text NOT NULL UNIQUE,
  CONSTRAINT "referendum_votes_referendum_citizen_unique" UNIQUE ("referendum_id", "citizen_id")
);

CREATE TABLE IF NOT EXISTS "marketplace_catalog" (
  "item_id" text PRIMARY KEY,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "category" text NOT NULL,
  "price_minor" bigint NOT NULL,
  "effect_key" text,
  "enabled" boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "citizen_inventory" (
  "inventory_id" text PRIMARY KEY,
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "item_id" text NOT NULL REFERENCES "marketplace_catalog"("item_id"),
  "acquired_at_game_ms" bigint NOT NULL,
  "idempotency_key" text NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS "citizen_inventory_citizen_idx"
  ON "citizen_inventory" ("citizen_id", "acquired_at_game_ms" DESC);

CREATE TABLE IF NOT EXISTS "job_offers" (
  "offer_id" text PRIMARY KEY,
  "title" text NOT NULL,
  "employer" text NOT NULL,
  "description" text NOT NULL,
  "occupation_code" integer NOT NULL,
  "salary_hint_minor" bigint NOT NULL,
  "enabled" boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "citizen_employment" (
  "citizen_id" text PRIMARY KEY REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "employment_state" text NOT NULL DEFAULT 'unemployed',
  "current_offer_id" text REFERENCES "job_offers"("offer_id"),
  "hired_at_game_ms" bigint,
  "updated_at_game_ms" bigint NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "citizen_messages" (
  "message_id" text PRIMARY KEY,
  "from_citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "to_citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "body" text NOT NULL,
  "sent_at_game_ms" bigint NOT NULL,
  "idempotency_key" text NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS "citizen_messages_to_idx"
  ON "citizen_messages" ("to_citizen_id", "sent_at_game_ms" DESC);

CREATE TABLE IF NOT EXISTS "citizen_economic_snapshots" (
  "snapshot_id" text PRIMARY KEY,
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "recorded_at_game_ms" bigint NOT NULL,
  "cash_minor" bigint NOT NULL,
  "inventory_value_minor" bigint NOT NULL DEFAULT 0,
  "net_worth_minor" bigint NOT NULL,
  "idempotency_key" text NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS "citizen_economic_snapshots_citizen_idx"
  ON "citizen_economic_snapshots" ("citizen_id", "recorded_at_game_ms" DESC);

-- Seed marketplace catalog
INSERT INTO "marketplace_catalog" ("item_id", "name", "description", "category", "price_minor", "effect_key")
VALUES
  ('item_bicycle_v1', 'Bicicletta usata', 'Per le emergenze quando i trasporti falliscono.', 'mobility', 3500, 'mobility_hint'),
  ('item_coffee_v1', 'Moka del vicinato', 'Non risolve i problemi, ma li rende più sopportabili.', 'living', 1200, null),
  ('item_toolkit_v1', 'Kit attrezzi base', 'Utile quando qualcosa si rompe. Spesso qualcosa si rompe.', 'living', 2800, null)
ON CONFLICT ("item_id") DO NOTHING;

-- Seed job offers
INSERT INTO "job_offers" ("offer_id", "title", "employer", "description", "occupation_code", "salary_hint_minor")
VALUES
  ('job_comune_clerk_v1', 'Impiegato comunale', 'Comune Virtuale', 'Archivi, timbri e sorrisi professionali.', 1, 12000),
  ('job_delivery_v1', 'Corriere espresso', 'Spedizioni Rapide', 'Consegne in città. Bonus se non perdi nulla.', 2, 9000),
  ('job_cafe_v1', 'Barista', 'Bar del Comune', 'Caffè, chiacchiere e turni imprevedibili.', 3, 8500)
ON CONFLICT ("offer_id") DO NOTHING;
