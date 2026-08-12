-- V1-CITIZEN-TIME-AND-LIFE-EVOLUTION-1: game clock controls + citizen temporal events

ALTER TABLE "world_clock"
  ADD COLUMN IF NOT EXISTS "is_paused" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "schema_version" integer NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS "citizen_life_evolution_state" (
  "citizen_id" text PRIMARY KEY REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "last_life_review_world_ms" bigint,
  "completed_tasks_at_last_review" integer NOT NULL DEFAULT 0,
  "life_review_count" integer NOT NULL DEFAULT 0,
  "employment_state" text,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "citizen_temporal_events" (
  "event_id" text PRIMARY KEY,
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "event_type" text NOT NULL,
  "idempotency_key" text NOT NULL,
  "world_time_ms" bigint NOT NULL,
  "real_at" timestamptz NOT NULL DEFAULT now(),
  "status" text NOT NULL DEFAULT 'applied'
    CHECK ("status" IN ('pending', 'applied', 'cancelled')),
  "title" text,
  "body" text,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE ("citizen_id", "idempotency_key")
);

CREATE INDEX IF NOT EXISTS "citizen_temporal_events_citizen_time_idx"
  ON "citizen_temporal_events" ("citizen_id", "world_time_ms" DESC);
