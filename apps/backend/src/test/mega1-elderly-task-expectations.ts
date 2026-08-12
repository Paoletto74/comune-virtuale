/** Merged registry + attribute effects for DEMO_ELDERLY_CROSSING (MEGA 1/2). */

export const MEGA1_ELDERLY_HELP_PERSONAL_VALUES = {
  sympathy: 9,
  reputation: 1,
  health: 1,
  civicParticipation: 1,
  culture: 2,
  happiness: 4,
} as const;

export const MEGA1_ELDERLY_IGNORE_PERSONAL_VALUES = {
  sympathy: 0,
  reputation: 0,
  stress: 4,
  happiness: 0,
} as const;

export const MEGA1_ELDERLY_HELP_SYMPATHY_DELTA = MEGA1_ELDERLY_HELP_PERSONAL_VALUES.sympathy;
