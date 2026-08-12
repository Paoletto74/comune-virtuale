-- Risk System v1: append-only risk outcomes for deterministic server-side rolls

CREATE TABLE IF NOT EXISTS "risk_outcomes" (
  "outcome_id" text PRIMARY KEY,
  "task_instance_id" text NOT NULL REFERENCES "task_instances"("task_instance_id") ON DELETE CASCADE,
  "option_id" text NOT NULL,
  "risk_spec_ref" text NOT NULL,
  "branch_id" text NOT NULL,
  "resolution_seed" text NOT NULL,
  "roll_digest" text NOT NULL,
  "idempotency_key" text NOT NULL UNIQUE,
  "correlation_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "risk_outcomes_task_option_unique" UNIQUE ("task_instance_id", "option_id")
);

CREATE INDEX IF NOT EXISTS "risk_outcomes_task_instance_id_idx" ON "risk_outcomes" ("task_instance_id");
