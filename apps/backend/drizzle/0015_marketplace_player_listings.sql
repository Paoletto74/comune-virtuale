-- P2P marketplace player listings (Occasioni)
CREATE TABLE IF NOT EXISTS "marketplace_player_listings" (
  "listing_id" text PRIMARY KEY NOT NULL,
  "seller_citizen_id" text NOT NULL REFERENCES "citizens"("citizen_id") ON DELETE CASCADE,
  "inventory_id" text NOT NULL REFERENCES "citizen_inventory"("inventory_id") ON DELETE CASCADE,
  "item_id" text NOT NULL REFERENCES "marketplace_catalog"("item_id"),
  "listing_type" text NOT NULL DEFAULT 'sale',
  "price_minor" bigint NOT NULL,
  "listed_at_game_ms" bigint NOT NULL,
  "expires_at_game_ms" bigint,
  "status" text NOT NULL DEFAULT 'active',
  "buyer_citizen_id" text REFERENCES "citizens"("citizen_id"),
  "sold_at_game_ms" bigint,
  "idempotency_key" text NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS "marketplace_player_listings_status_idx"
  ON "marketplace_player_listings" ("status", "listed_at_game_ms");

CREATE INDEX IF NOT EXISTS "marketplace_player_listings_seller_idx"
  ON "marketplace_player_listings" ("seller_citizen_id", "status");
