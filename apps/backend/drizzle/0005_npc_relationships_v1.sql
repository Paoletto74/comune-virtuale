-- V1-NPC-RELATIONSHIPS-1: persistent NPC identity + citizen↔NPC memory

ALTER TABLE "npcs"
  ADD COLUMN IF NOT EXISTS "npc_template_id" text,
  ADD COLUMN IF NOT EXISTS "category" text,
  ADD COLUMN IF NOT EXISTS "narrative_role" text,
  ADD COLUMN IF NOT EXISTS "occupation" text,
  ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS "npcs_template_idx" ON "npcs" ("npc_template_id");

CREATE TABLE IF NOT EXISTS "citizen_npc_relationships" (
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "npc_id" text NOT NULL REFERENCES "npcs"("npc_id") ON DELETE CASCADE,
  "relationship_level" integer NOT NULL DEFAULT 0,
  "interaction_count" integer NOT NULL DEFAULT 0,
  "last_interaction_at" timestamptz,
  "last_outcome_key" text,
  "last_outcome_summary" text,
  "sentiment" text NOT NULL DEFAULT 'neutral'
    CHECK ("sentiment" IN ('positive', 'negative', 'neutral')),
  "first_met_at" timestamptz NOT NULL DEFAULT now(),
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY ("citizen_id", "npc_id")
);

CREATE INDEX IF NOT EXISTS "citizen_npc_relationships_citizen_idx"
  ON "citizen_npc_relationships" ("citizen_id");

CREATE TABLE IF NOT EXISTS "citizen_npc_interactions" (
  "interaction_id" text PRIMARY KEY,
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "npc_id" text NOT NULL REFERENCES "npcs"("npc_id") ON DELETE CASCADE,
  "task_instance_id" text REFERENCES "task_instances"("task_instance_id") ON DELETE SET NULL,
  "definition_id" text NOT NULL,
  "option_id" text NOT NULL,
  "outcome_key" text NOT NULL,
  "outcome_summary" text NOT NULL,
  "occurred_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "citizen_npc_interactions_citizen_npc_idx"
  ON "citizen_npc_interactions" ("citizen_id", "npc_id", "occurred_at" DESC);
