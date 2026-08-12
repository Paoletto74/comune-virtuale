/** Citizen personalValues range — progression_balance_v1/schema.yaml */
export const PERSONAL_VALUE_MIN = 0;
export const PERSONAL_VALUE_MAX = 100;

export function personalValueFillPercent(value: number): number {
  const clamped = Math.max(PERSONAL_VALUE_MIN, Math.min(PERSONAL_VALUE_MAX, value));
  return (clamped / PERSONAL_VALUE_MAX) * 100;
}
