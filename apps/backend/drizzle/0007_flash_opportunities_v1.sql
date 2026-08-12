-- V1-FLASH-OPPORTUNITIES-1: flash opportunity instances + citizen spawn state

CREATE TABLE IF NOT EXISTS "flash_opportunities" (
  "opportunity_id" text PRIMARY KEY,
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "template_id" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "source_context" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "reward" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "risk" jsonb,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "status" text NOT NULL DEFAULT 'pending'
    CHECK ("status" IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "idempotency_key" text NOT NULL,
  UNIQUE ("citizen_id", "idempotency_key")
);

CREATE INDEX IF NOT EXISTS "flash_opportunities_citizen_status_idx"
  ON "flash_opportunities" ("citizen_id", "status", "expires_at" DESC);

CREATE TABLE IF NOT EXISTS "citizen_flash_spawn_state" (
  "citizen_id" text PRIMARY KEY REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "spawn_cycle" integer NOT NULL DEFAULT 0,
  "anticipation_started_at" timestamptz,
  "anticipation_duration_ms" integer,
  "anticipation_label" text,
  "next_spawn_eligible_at" timestamptz,
  "last_opportunity_at" timestamptz,
  "last_expired_notice" text,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
