/**
 * Personal values — mirrors progression_balance_v1/schema.yaml (frontend display).
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

export type StatEffectsPreview = Partial<PersonalValuesRecord> & { cashMinor?: string };

export function formatStatEffectLabel(key: PersonalValueKey, value: number): string {
  const label = PERSONAL_VALUE_LABELS[key].toUpperCase();
  return `${value > 0 ? '+' : ''}${value} ${label}`;
}
