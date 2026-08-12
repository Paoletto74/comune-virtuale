CREATE TABLE IF NOT EXISTS "admin_content_entries" (
  "content_id" text PRIMARY KEY NOT NULL,
  "category" text NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "title" text NOT NULL,
  "body" text NOT NULL,
  "raw_text" text NOT NULL,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_by_account_id" text NOT NULL,
  "updated_by_account_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "admin_content_entries_category_status_idx"
  ON "admin_content_entries" ("category", "status", "updated_at" DESC);

CREATE INDEX IF NOT EXISTS "admin_content_entries_status_updated_idx"
  ON "admin_content_entries" ("status", "updated_at" DESC);
