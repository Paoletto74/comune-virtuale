/** Initial personality allocation — trade-off pool (sum must equal PERSONALITY_POINT_POOL). */
export const PERSONALITY_POINT_POOL = 90;
export const PERSONALITY_STAT_MIN = 10;
export const PERSONALITY_STAT_MAX = 50;

export interface PersonalityAllocation {
  sympathy: number;
  reputation: number;
  happiness: number;
}

export function validatePersonalityAllocation(input: PersonalityAllocation): void {
  const { sympathy, reputation, happiness } = input;
  for (const [key, value] of Object.entries({ sympathy, reputation, happiness })) {
    if (!Number.isInteger(value) || value < PERSONALITY_STAT_MIN || value > PERSONALITY_STAT_MAX) {
      throw new Error(`INVALID_PERSONALITY_${key.toUpperCase()}`);
    }
  }
  if (sympathy + reputation + happiness !== PERSONALITY_POINT_POOL) {
    throw new Error('INVALID_PERSONALITY_SUM');
  }
}

/** Default balanced archetype when client omits personality. */
export const DEFAULT_PERSONALITY: PersonalityAllocation = {
  sympathy: 30,
  reputation: 30,
  happiness: 30,
};
