/** Runtime job requirements — keyed by offerId until dedicated DB columns exist. */
import type { PersonalValueKey } from './personal-values-constants.js';
import { PERSONAL_VALUE_KEYS, PERSONAL_VALUE_LABELS } from './personal-values-constants.js';

export type JobStatRequirements = Partial<Record<PersonalValueKey, number>>;

export const JOB_OFFER_REQUIREMENTS: Record<string, JobStatRequirements> = {
  job_cafe_v1: { sympathy: 35, reputation: 10 },
  job_supermarket_v1: { sympathy: 30, reputation: 20 },
  job_gardener_v1: { sympathy: 25, happiness: 20, health: 15 },
  job_mechanic_v1: { reputation: 30, happiness: 15, experience: 20 },
  job_teacher_v1: { sympathy: 40, reputation: 35, happiness: 25, education: 35, culture: 20 },
  job_nurse_v1: { sympathy: 45, reputation: 30, happiness: 30, health: 25 },
  job_baker_v1: { sympathy: 25, happiness: 20 },
  job_cleaner_v1: { reputation: 15, reliability: 20 },
  job_comune_clerk_v1: { culture: 15, civicParticipation: 20, reputation: 25 },
  job_accountant_v1: { reputation: 50, happiness: 30, education: 30, reliability: 25 },
  job_engineer_v1: { reputation: 60, happiness: 35, education: 40, culture: 25 },
  job_lawyer_v1: { reputation: 65, sympathy: 40, education: 45, politicalInfluence: 30 },
};

export function getJobRequirements(offerId: string): JobStatRequirements | null {
  return JOB_OFFER_REQUIREMENTS[offerId] ?? null;
}

export function meetsJobRequirements(
  offerId: string,
  stats: Partial<Record<PersonalValueKey, number>>,
  _mainLevel?: number,
): { ok: true } | { ok: false; missing: JobStatRequirements & { mainLevel?: number } } {
  const req = getJobRequirements(offerId);
  const missing: JobStatRequirements & { mainLevel?: number } = {};

  if (req) {
    for (const key of PERSONAL_VALUE_KEYS) {
      const required = req[key];
      if (required == null) continue;
      const current = stats[key] ?? 0;
      if (current < required) missing[key] = required;
    }
  }

  return Object.keys(missing).length === 0 ? { ok: true } : { ok: false, missing };
}

export function formatJobRequirementLabel(key: PersonalValueKey | 'mainLevel', value: number): string {
  if (key === 'mainLevel') return `Livello ${value}`;
  return `${PERSONAL_VALUE_LABELS[key as PersonalValueKey]} ${value}`;
}
