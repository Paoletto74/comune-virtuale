CREATE TABLE IF NOT EXISTS npc_portrait_assignments (
  template_id TEXT PRIMARY KEY,
  portrait_id TEXT NOT NULL,
  updated_by_account_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_npc_portrait_assignments_portrait_id
  ON npc_portrait_assignments (portrait_id);
