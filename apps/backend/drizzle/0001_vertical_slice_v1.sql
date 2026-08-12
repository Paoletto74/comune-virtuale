CREATE TABLE IF NOT EXISTS "citizens" (
  "citizen_id" text PRIMARY KEY,
  "account_id" text NOT NULL UNIQUE,
  "display_name" text NOT NULL,
  "gender" text NOT NULL,
  "age" integer NOT NULL,
  "onboarding_completed_at" timestamptz NOT NULL DEFAULT now(),
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "citizen_progression" (
  "citizen_id" text PRIMARY KEY REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "main_level_id" text NOT NULL DEFAULT 'main_L01',
  "main_level" integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "citizen_personal_values" (
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "value_key" text NOT NULL,
  "value" integer NOT NULL,
  PRIMARY KEY ("citizen_id", "value_key")
);

CREATE TABLE IF NOT EXISTS "task_instances" (
  "task_instance_id" text PRIMARY KEY,
  "definition_id" text NOT NULL,
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "status" text NOT NULL,
  "selected_option_id" text,
  "completed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "expires_at" timestamptz
);

CREATE INDEX IF NOT EXISTS "task_instances_citizen_status_idx"
  ON "task_instances" ("citizen_id", "status");
