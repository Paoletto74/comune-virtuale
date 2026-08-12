/**
 * Personal values from progression_balance_v1/schema.yaml — single canonical list.
 * Stored in citizen_personal_values (EAV); clamped 0–100 at runtime.
 */

export const PERSONAL_VALUE_KEYS = [
  'happiness',
  'health',
  'culture',
  'education',
  'politicalInfluence',
  'popularity',
  'experience',
  'stress',
  'luck',
  'reliability',
  'civicParticipation',
  'freeTime',
  'reputation',
  'sympathy',
] as const;

export type PersonalValueKey = (typeof PERSONAL_VALUE_KEYS)[number];

export const PERSONAL_VALUE_LABELS: Record<PersonalValueKey, string> = {
  happiness: 'Felicità',
  health: 'Salute',
  culture: 'Cultura',
  education: 'Istruzione',
  politicalInfluence: 'Influenza politica',
  popularity: 'Popolarità',
  experience: 'Esperienza',
  stress: 'Stress',
  luck: 'Fortuna',
  reliability: 'Affidabilità',
  civicParticipation: 'Partecipazione civica',
  freeTime: 'Tempo libero',
  reputation: 'Reputazione',
  sympathy: 'Simpatia',
};

export type PersonalValuesRecord = Record<PersonalValueKey, number>;

export function createZeroPersonalValues(): PersonalValuesRecord {
  return Object.fromEntries(PERSONAL_VALUE_KEYS.map((key) => [key, 0])) as PersonalValuesRecord;
}

export function personalValuesFromPartial(
  partial: Partial<PersonalValuesRecord> | Record<string, number>,
): PersonalValuesRecord {
  const base = createZeroPersonalValues();
  for (const key of PERSONAL_VALUE_KEYS) {
    const value = partial[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      base[key] = value;
    }
  }
  return base;
}

export function mergePersonalValueDelta(
  target: PersonalValuesRecord,
  delta: Partial<PersonalValuesRecord> | Record<string, number>,
): PersonalValuesRecord {
  const next = { ...target };
  for (const [key, value] of Object.entries(delta)) {
    if (!(PERSONAL_VALUE_KEYS as readonly string[]).includes(key)) continue;
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    next[key as PersonalValueKey] = (next[key as PersonalValueKey] ?? 0) + value;
  }
  return next;
}

export function nonZeroPersonalDeltas(
  delta: Partial<PersonalValuesRecord> | Record<string, number>,
): Partial<PersonalValuesRecord> {
  const result: Partial<PersonalValuesRecord> = {};
  for (const key of PERSONAL_VALUE_KEYS) {
    const value = delta[key];
    if (value != null && value !== 0) {
      result[key] = value;
    }
  }
  return result;
}
