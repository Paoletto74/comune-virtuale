-- V1-WORLD-EVENTS-1: world event engine (game-time lifecycle)

CREATE TABLE IF NOT EXISTS "world_events" (
  "event_id" text PRIMARY KEY,
  "template_id" text NOT NULL,
  "scope" text NOT NULL,
  "type" text NOT NULL,
  "status" text NOT NULL,
  "severity" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "comune_line" text,
  "source" text NOT NULL DEFAULT 'system',
  "started_at_game_ms" bigint NOT NULL,
  "ends_at_game_ms" bigint NOT NULL,
  "effects" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "idempotency_key" text NOT NULL,
  "zone_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "world_events_idempotency_key_unique" UNIQUE ("idempotency_key")
);

CREATE INDEX IF NOT EXISTS "world_events_status_time_idx"
  ON "world_events" ("status", "started_at_game_ms" DESC);

CREATE TABLE IF NOT EXISTS "world_event_scheduler_state" (
  "id" integer PRIMARY KEY DEFAULT 1,
  "last_evaluated_game_ms" bigint NOT NULL DEFAULT 0,
  "spawn_cycle" integer NOT NULL DEFAULT 0,
  "last_spawned_game_ms" bigint,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

INSERT INTO "world_event_scheduler_state" ("id")
VALUES (1)
ON CONFLICT ("id") DO NOTHING;

CREATE TABLE IF NOT EXISTS "citizen_world_event_notices" (
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "world_event_id" text NOT NULL REFERENCES "world_events"("event_id") ON DELETE CASCADE,
  "idempotency_key" text NOT NULL,
  "noticed_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("citizen_id", "world_event_id"),
  CONSTRAINT "citizen_world_event_notices_idempotency_unique" UNIQUE ("idempotency_key")
);
