-- Phase 1: career data model + progression threshold migration (levels 1–20)

CREATE TABLE IF NOT EXISTS citizen_career_state (
  citizen_id text PRIMARY KEY REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  current_career_id text,
  current_grade_index integer NOT NULL DEFAULT 1,
  emerging_trajectories jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS citizen_career_affinities (
  citizen_id text NOT NULL REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  career_id text NOT NULL,
  affinity integer NOT NULL DEFAULT 0,
  PRIMARY KEY (citizen_id, career_id),
  CONSTRAINT citizen_career_affinities_range CHECK (affinity >= 0 AND affinity <= 100)
);

CREATE TABLE IF NOT EXISTS citizen_career_history (
  history_id text PRIMARY KEY,
  citizen_id text NOT NULL REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  career_id text NOT NULL,
  grade_index integer NOT NULL DEFAULT 1,
  change_type text NOT NULL DEFAULT 'seed',
  reason text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS citizen_career_history_citizen_idx
  ON citizen_career_history (citizen_id, recorded_at DESC);

-- Preserve earned levels: floor XP to new threshold for stored main_level (1–10 legacy).
UPDATE citizen_progression
SET progression_points = GREATEST(
  progression_points,
  CASE main_level
    WHEN 20 THEN 75000
    WHEN 19 THEN 62000
    WHEN 18 THEN 52000
    WHEN 17 THEN 44000
    WHEN 16 THEN 37000
    WHEN 15 THEN 31000
    WHEN 14 THEN 26000
    WHEN 13 THEN 21500
    WHEN 12 THEN 17500
    WHEN 11 THEN 14000
    WHEN 10 THEN 11000
    WHEN 9 THEN 8400
    WHEN 8 THEN 6300
    WHEN 7 THEN 4600
    WHEN 6 THEN 3200
    WHEN 5 THEN 2100
    WHEN 4 THEN 1300
    WHEN 3 THEN 700
    WHEN 2 THEN 100
    ELSE 0
  END
);

-- Recalculate main_level from updated points (new thresholds).
UPDATE citizen_progression
SET
  main_level = CASE
    WHEN progression_points >= 75000 THEN 20
    WHEN progression_points >= 62000 THEN 19
    WHEN progression_points >= 52000 THEN 18
    WHEN progression_points >= 44000 THEN 17
    WHEN progression_points >= 37000 THEN 16
    WHEN progression_points >= 31000 THEN 15
    WHEN progression_points >= 26000 THEN 14
    WHEN progression_points >= 21500 THEN 13
    WHEN progression_points >= 17500 THEN 12
    WHEN progression_points >= 14000 THEN 11
    WHEN progression_points >= 11000 THEN 10
    WHEN progression_points >= 8400 THEN 9
    WHEN progression_points >= 6300 THEN 8
    WHEN progression_points >= 4600 THEN 7
    WHEN progression_points >= 3200 THEN 6
    WHEN progression_points >= 2100 THEN 5
    WHEN progression_points >= 1300 THEN 4
    WHEN progression_points >= 700 THEN 4
    WHEN progression_points >= 300 THEN 3
    WHEN progression_points >= 100 THEN 2
    ELSE 1
  END;

UPDATE citizen_progression
SET main_level_id = 'main_L' || LPAD(main_level::text, 2, '0');

-- Seed career affinities for existing citizens (demo careers at 0).
INSERT INTO citizen_career_affinities (citizen_id, career_id, affinity)
SELECT c.citizen_id, career.career_id, 0
FROM citizens c
CROSS JOIN (
  VALUES ('medicina'), ('motorsport'), ('criminalita')
) AS career(career_id)
ON CONFLICT (citizen_id, career_id) DO NOTHING;

INSERT INTO citizen_career_state (citizen_id, current_career_id, current_grade_index)
SELECT c.citizen_id, NULL, 1
FROM citizens c
ON CONFLICT (citizen_id) DO NOTHING;
