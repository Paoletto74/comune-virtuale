-- Game Surface: job applications, per-offer engagements, marketplace price tuning

CREATE TABLE IF NOT EXISTS "citizen_job_applications" (
  "application_id" text PRIMARY KEY,
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "offer_id" text NOT NULL REFERENCES "job_offers"("offer_id"),
  "decision" text NOT NULL,
  "decided_at_game_ms" bigint NOT NULL,
  "idempotency_key" text NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS "citizen_job_applications_citizen_idx"
  ON "citizen_job_applications" ("citizen_id", "decided_at_game_ms" DESC);

CREATE TABLE IF NOT EXISTS "citizen_job_engagements" (
  "citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "offer_id" text NOT NULL REFERENCES "job_offers"("offer_id"),
  "status" text NOT NULL,
  "hired_at_game_ms" bigint,
  "shift_started_at_game_ms" bigint,
  "shift_ends_at_game_ms" bigint,
  "blocked_until_game_ms" bigint,
  "last_application_id" text REFERENCES "citizen_job_applications"("application_id"),
  "updated_at_game_ms" bigint NOT NULL DEFAULT 0,
  PRIMARY KEY ("citizen_id", "offer_id")
);

CREATE INDEX IF NOT EXISTS "citizen_job_engagements_status_idx"
  ON "citizen_job_engagements" ("citizen_id", "status");

-- Monthly salary hints (minor units = euro)
UPDATE "job_offers"
SET "salary_hint_minor" = 2500
WHERE "offer_id" = 'job_comune_clerk_v1';

UPDATE "job_offers"
SET "salary_hint_minor" = 1800
WHERE "offer_id" = 'job_delivery_v1';

UPDATE "job_offers"
SET "salary_hint_minor" = 1500
WHERE "offer_id" = 'job_cafe_v1';

-- Marketplace prices tuned to monthly salaries (~€1.500–2.500) and starter cash
UPDATE "marketplace_catalog"
SET "price_minor" = 35
WHERE "item_id" = 'item_coffee_v1';

UPDATE "marketplace_catalog"
SET "price_minor" = 95
WHERE "item_id" = 'item_toolkit_v1';

UPDATE "marketplace_catalog"
SET "price_minor" = 280
WHERE "item_id" = 'item_bicycle_v1';
