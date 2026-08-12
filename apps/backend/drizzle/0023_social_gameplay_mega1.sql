-- MEGA 1/2: extended relationships, groups, chat, career switch tracking

ALTER TABLE citizen_npc_relationships
  ADD COLUMN IF NOT EXISTS trust integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS affection integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conflict integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS familiarity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS relationship_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS relationship_state text NOT NULL DEFAULT 'conoscenza',
  ADD COLUMN IF NOT EXISTS contact_unlocked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS chat_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE citizen_career_state
  ADD COLUMN IF NOT EXISTS pending_switch_career_id text,
  ADD COLUMN IF NOT EXISTS pending_switch_streak integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS social_groups (
  group_id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  group_type text NOT NULL DEFAULT 'social',
  member_npc_template_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS citizen_group_relationships (
  citizen_id text NOT NULL REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  group_id text NOT NULL REFERENCES social_groups(group_id) ON DELETE CASCADE,
  relationship_level integer NOT NULL DEFAULT 0,
  familiarity integer NOT NULL DEFAULT 0,
  relationship_score integer NOT NULL DEFAULT 0,
  relationship_state text NOT NULL DEFAULT 'conoscenza',
  contact_unlocked boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (citizen_id, group_id)
);

CREATE TABLE IF NOT EXISTS citizen_chat_threads (
  thread_id text PRIMARY KEY,
  citizen_id text NOT NULL REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  counterpart_type text NOT NULL DEFAULT 'npc',
  counterpart_id text NOT NULL,
  scenario_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  step_index integer NOT NULL DEFAULT 0,
  message_count integer NOT NULL DEFAULT 0,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  idempotency_key text NOT NULL,
  UNIQUE (citizen_id, counterpart_type, counterpart_id, scenario_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS citizen_chat_messages (
  message_id text PRIMARY KEY,
  thread_id text NOT NULL REFERENCES citizen_chat_threads(thread_id) ON DELETE CASCADE,
  speaker text NOT NULL,
  body text NOT NULL,
  selected_option_id text,
  option_snapshot jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS citizen_npc_spontaneous_inbox (
  inbox_id text PRIMARY KEY,
  citizen_id text NOT NULL REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  npc_id text NOT NULL REFERENCES npcs(npc_id) ON DELETE CASCADE,
  scenario_id text NOT NULL,
  title text NOT NULL,
  preview text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  idempotency_key text NOT NULL,
  UNIQUE (citizen_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS citizen_chat_threads_citizen_idx
  ON citizen_chat_threads (citizen_id, status, last_message_at DESC);

CREATE INDEX IF NOT EXISTS citizen_npc_spontaneous_inbox_citizen_idx
  ON citizen_npc_spontaneous_inbox (citizen_id, status, created_at DESC);

-- Demo groups seed
INSERT INTO social_groups (group_id, name, description, group_type, member_npc_template_ids)
VALUES
  ('group_calcetto_mercoledi', 'Gruppo calcetto del mercoledì', 'I tuoi amici del mercoledì sera. Perdi sempre, ma ci torni.', 'sport', '["youth_luca","worker_tommaso","youth_chiara","family_neighbor_dario"]'::jsonb),
  ('group_bar_sotto_casa', 'Bar sotto casa', 'Clienti abituali del bar. Commentano tutto, pagano poco.', 'social', '["worker_sara","merchant_salvatore","youth_luca"]'::jsonb),
  ('group_quartiere_residenziale', 'Comitato di quartiere', 'Vicini organizzati. Più pericolosi dei criminali, ma con verbale.', 'civic', '["neighbor_marco","family_neighbor_paola","elderly_signora_villa","family_neighbor_dario"]'::jsonb),
  ('group_notturni', 'Circuito notturno', 'Facce che conosci solo dopo mezzanotte. Non fare domande.', 'ambiguous', '["ambiguous_night_renato","ambiguous_night_nadia"]'::jsonb),
  ('group_salute_locale', 'Rete sanitaria di paese', 'Medici, infermieri, e chi fa finta di capire le ricette.', 'professional', '["professional_dr_neri","civic_librarian_orsi"]'::jsonb)
ON CONFLICT (group_id) DO NOTHING;
