-- Marketplace automation: NPC buyers/tenants + rental metadata
ALTER TABLE "marketplace_player_listings" ADD COLUMN IF NOT EXISTS "buyer_npc_id" text;
ALTER TABLE "marketplace_player_listings" ADD COLUMN IF NOT EXISTS "npc_resolve_after_game_ms" bigint;

ALTER TABLE "citizen_rentals" ALTER COLUMN "tenant_citizen_id" DROP NOT NULL;
ALTER TABLE "citizen_rentals" ADD COLUMN IF NOT EXISTS "tenant_npc_id" text;
ALTER TABLE "citizen_rentals" ADD COLUMN IF NOT EXISTS "monthly_rent_minor" bigint;

CREATE INDEX IF NOT EXISTS "marketplace_player_listings_npc_resolve_idx"
  ON "marketplace_player_listings" ("status", "npc_resolve_after_game_ms");

CREATE INDEX IF NOT EXISTS "citizen_rentals_owner_status_idx"
  ON "citizen_rentals" ("owner_citizen_id", "status");
