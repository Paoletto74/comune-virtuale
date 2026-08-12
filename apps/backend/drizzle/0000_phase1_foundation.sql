CREATE TABLE IF NOT EXISTS "world_clock" (
  "id" integer PRIMARY KEY DEFAULT 1,
  "world_time_ms" bigint NOT NULL,
  "time_scale" double precision NOT NULL DEFAULT 1.0,
  "real_updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "session_id" text PRIMARY KEY,
  "account_id" text NOT NULL,
  "citizen_id" text NOT NULL,
  "roles" jsonb NOT NULL DEFAULT '["PLAYER"]'::jsonb,
  "expires_at" timestamptz NOT NULL,
  "revoked_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "idempotency_keys" (
  "key" text PRIMARY KEY,
  "command_type" text NOT NULL,
  "response_body" jsonb NOT NULL,
  "status_code" integer NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "expires_at" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "correlation_id" text NOT NULL,
  "actor_id" text,
  "action" text NOT NULL,
  "target_id" text,
  "payload" jsonb,
  "world_time_ms" bigint,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

INSERT INTO "world_clock" ("id", "world_time_ms", "time_scale")
VALUES (1, 0, 1.0)
ON CONFLICT ("id") DO NOTHING;
