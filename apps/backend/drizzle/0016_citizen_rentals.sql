-- Temporary housing rentals (affitto)
CREATE TABLE IF NOT EXISTS "citizen_rentals" (
  "rental_id" text PRIMARY KEY NOT NULL,
  "tenant_citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "owner_citizen_id" text,
  "item_id" text NOT NULL REFERENCES "marketplace_catalog"("item_id"),
  "listing_id" text REFERENCES "marketplace_player_listings"("listing_id"),
  "started_at_game_ms" bigint NOT NULL,
  "expires_at_game_ms" bigint NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "idempotency_key" text NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS "citizen_rentals_tenant_status_idx"
  ON "citizen_rentals" ("tenant_citizen_id", "status");

CREATE INDEX IF NOT EXISTS "citizen_rentals_expires_idx"
  ON "citizen_rentals" ("status", "expires_at_game_ms");
