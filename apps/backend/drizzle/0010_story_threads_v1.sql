-- V1-EMERGENT-LIFE-CHAINS-1: emergent story thread orchestrator

CREATE TABLE IF NOT EXISTS "story_threads" (
  "thread_id" text PRIMARY KEY,
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "status" text NOT NULL,
  "origin" text NOT NULL,
  "stage" integer NOT NULL DEFAULT 1,
  "priority" double precision NOT NULL DEFAULT 1,
  "created_at_game_ms" bigint NOT NULL,
  "last_activity_game_ms" bigint NOT NULL,
  "dormant_until_game_ms" bigint,
  "expires_at_game_ms" bigint,
  "context" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "idempotency_key" text NOT NULL,
  CONSTRAINT "story_threads_idempotency_key_unique" UNIQUE ("idempotency_key")
);

CREATE INDEX IF NOT EXISTS "story_threads_citizen_status_idx"
  ON "story_threads" ("citizen_id", "status", "last_activity_game_ms" DESC);
