/**
 * Master Prompt attribute aliases → canonical personal value keys.
 * Reuses existing citizen_personal_values — no duplicate storage.
 */
import {
  PERSONAL_VALUE_KEYS,
  PERSONAL_VALUE_LABELS,
  type PersonalValueKey,
  personalValuesFromPartial,
} from './personal-values-constants.js';

/** Conceptual labels for UI (Italian). */
export const ATTRIBUTE_DISPLAY_LABELS: Record<string, string> = {
  ...PERSONAL_VALUE_LABELS,
  socialita: 'Socialità',
  intelligenza: 'Intelligenza',
  energia: 'Energia',
  carisma: 'Carisma',
  professionalita: 'Professionalità',
  coraggio: 'Coraggio',
  creativita: 'Creatività',
  serenita: 'Serenità',
  nervosismo: 'Nervosismo',
  soddisfazione: 'Soddisfazione',
};

/** Maps master-prompt / YAML aliases to canonical keys. */
export const ATTRIBUTE_KEY_ALIASES: Readonly<Record<string, PersonalValueKey>> = {
  cultura: 'culture',
  culture: 'culture',
  socialita: 'popularity',
  socialità: 'popularity',
  popularity: 'popularity',
  intelligenza: 'education',
  education: 'education',
  salute: 'health',
  health: 'health',
  energia: 'freeTime',
  freetime: 'freeTime',
  freeTime: 'freeTime',
  reputazione: 'reputation',
  reputation: 'reputation',
  carisma: 'popularity',
  professionalita: 'reliability',
  professionalità: 'reliability',
  reliability: 'reliability',
  coraggio: 'luck',
  luck: 'luck',
  creativita: 'experience',
  creatività: 'experience',
  experience: 'experience',
  serenita: 'happiness',
  serenità: 'happiness',
  happiness: 'happiness',
  nervosismo: 'stress',
  stress: 'stress',
  soddisfazione: 'happiness',
  simpatia: 'sympathy',
  sympathy: 'sympathy',
  civicparticipation: 'civicParticipation',
  civicParticipation: 'civicParticipation',
  politicalinfluence: 'politicalInfluence',
  politicalInfluence: 'politicalInfluence',
};

export type AttributeCostMap = Partial<Record<PersonalValueKey, number>>;

export function resolveAttributeKey(raw: string): PersonalValueKey | null {
  const normalized = raw.trim();
  if ((PERSONAL_VALUE_KEYS as readonly string[]).includes(normalized)) {
    return normalized as PersonalValueKey;
  }
  const alias = ATTRIBUTE_KEY_ALIASES[normalized.toLowerCase()] ?? ATTRIBUTE_KEY_ALIASES[normalized];
  return alias ?? null;
}

export function normalizeAttributeMap(
  partial: Record<string, number> | undefined,
): AttributeCostMap {
  if (!partial) return {};
  const result: AttributeCostMap = {};
  for (const [rawKey, value] of Object.entries(partial)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value === 0) continue;
    const key = resolveAttributeKey(rawKey);
    if (!key) continue;
    result[key] = (result[key] ?? 0) + value;
  }
  return result;
}

export function mergeAttributeMaps(...maps: AttributeCostMap[]): AttributeCostMap {
  const merged: AttributeCostMap = {};
  for (const map of maps) {
    for (const [key, value] of Object.entries(map)) {
      if (value == null || value === 0) continue;
      merged[key as PersonalValueKey] = (merged[key as PersonalValueKey] ?? 0) + value;
    }
  }
  return merged;
}

export function checkAttributeRequirements(
  current: Record<string, number>,
  required: AttributeCostMap,
): { ok: true } | { ok: false; missing: Array<{ key: PersonalValueKey; label: string; required: number; available: number }> } {
  const values = personalValuesFromPartial(current);
  const missing: Array<{ key: PersonalValueKey; label: string; required: number; available: number }> = [];
  for (const [key, amount] of Object.entries(required)) {
    if (!amount || amount <= 0) continue;
    const available = values[key as PersonalValueKey] ?? 0;
    if (available < amount) {
      missing.push({
        key: key as PersonalValueKey,
        label: PERSONAL_VALUE_LABELS[key as PersonalValueKey],
        required: amount,
        available,
      });
    }
  }
  if (missing.length > 0) return { ok: false, missing };
  return { ok: true };
}

export function projectAttributePreview(
  current: Record<string, number>,
  costs: AttributeCostMap,
  deltas: AttributeCostMap,
): Record<PersonalValueKey, { before: number; after: number }> {
  const values = personalValuesFromPartial(current);
  const keys = new Set<PersonalValueKey>([
    ...Object.keys(costs),
    ...Object.keys(deltas),
  ] as PersonalValueKey[]);
  const preview: Record<string, { before: number; after: number }> = {};
  for (const key of keys) {
    const before = values[key] ?? 0;
    const cost = costs[key] ?? 0;
    const delta = deltas[key] ?? 0;
    const after = Math.max(0, Math.min(100, before - cost + delta));
    preview[key] = { before, after };
  }
  return preview as Record<PersonalValueKey, { before: number; after: number }>;
}
