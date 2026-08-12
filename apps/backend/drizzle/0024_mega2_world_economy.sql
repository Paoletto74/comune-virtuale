-- MEGA 2/4: autonomous inflation price index, inventory cost basis

ALTER TABLE municipality_state
  ADD COLUMN IF NOT EXISTS price_index_bps integer NOT NULL DEFAULT 10000;

ALTER TABLE municipality_state
  ADD COLUMN IF NOT EXISTS last_inflation_tick_game_ms bigint NOT NULL DEFAULT 0;

ALTER TABLE municipality_inflation_history
  ADD COLUMN IF NOT EXISTS price_index_bps integer NOT NULL DEFAULT 10000;

ALTER TABLE citizen_inventory
  ADD COLUMN IF NOT EXISTS purchase_price_minor bigint;

ALTER TABLE citizen_inventory
  ADD COLUMN IF NOT EXISTS purchase_price_index_bps integer;
