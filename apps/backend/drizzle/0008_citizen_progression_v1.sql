-- V1-CITIZEN-PROGRESSION-1: progression points + idempotent grants

ALTER TABLE "citizen_progression"
  ADD COLUMN IF NOT EXISTS "progression_points" integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "citizen_progression_grants" (
  "grant_id" text PRIMARY KEY,
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "idempotency_key" text NOT NULL,
  "points_granted" integer NOT NULL,
  "source_type" text NOT NULL,
  "source_ref" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "citizen_progression_grants_citizen_idempotency_unique"
    UNIQUE ("citizen_id", "idempotency_key")
);

CREATE INDEX IF NOT EXISTS "citizen_progression_grants_citizen_idx"
  ON "citizen_progression_grants" ("citizen_id", "created_at" DESC);
