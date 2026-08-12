-- V1-FIRST-PLAYTEST-BUGFIX-1: persist world event popup dismiss per citizen

ALTER TABLE "citizen_world_event_notices"
  ADD COLUMN IF NOT EXISTS "popup_dismissed_at" timestamptz;
