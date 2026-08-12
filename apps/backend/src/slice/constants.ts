/**
 * Vertical Slice V1 — runtime decisions (NOT content pack modifications).
 * See docs/phase2/vertical-slice-v1-decisions.md
 */

/** Account session placeholder until POST /api/v1/citizens completes. */
export const PENDING_CITIZEN_ID = '__pending__';

export function isPendingCitizen(citizenId: string): boolean {
  return citizenId === PENDING_CITIZEN_ID;
}

/** Demo task spawned once after citizen creation (B3). */
export const SLICE_DEMO_TASK_DEFINITION_ID = 'DEMO_ELDERLY_CROSSING';

export const SLICE_DEMO_STEAL_WALLET_EFFECT_REF = 'DEMO_STEAL_WALLET_IMMEDIATE';

/** Options implemented in slice V1.1 + B.2-B steal_wallet. */
export const SLICE_DEMO_TASK_OPTION_HELP = 'help';
export const SLICE_DEMO_TASK_OPTION_IGNORE = 'ignore';
export const SLICE_DEMO_TASK_OPTION_STEAL_WALLET = 'steal_wallet';

export const SLICE_DEMO_TASK_ALLOWED_OPTIONS = [
  SLICE_DEMO_TASK_OPTION_HELP,
  SLICE_DEMO_TASK_OPTION_IGNORE,
  SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
] as const;

export type SliceDemoTaskOptionId = (typeof SLICE_DEMO_TASK_ALLOWED_OPTIONS)[number];

/** Effect set ref from task_main_v1/options.yaml — magnitudes resolved at runtime. */
export const SLICE_DEMO_HELP_EFFECT_REF = 'DEMO_HELP_ELDERLY_IMMEDIATE';

import {
  createZeroPersonalValues,
  PERSONAL_VALUE_KEYS,
  type PersonalValueKey,
} from './personal-values-constants.js';

/**
 * SLICE V1 DECISION — personal value baseline.
 * Approved packs do not define starting sympathy/reputation.
 * DB requires NOT NULL; baseline is 0 until gameplay effects apply.
 */
export const SLICE_INITIAL_PERSONAL_VALUES = createZeroPersonalValues();

export const PERSONAL_VALUE_CLAMP_MIN = 0;
export const PERSONAL_VALUE_CLAMP_MAX = 100;

export const CLAMPED_PERSONAL_VALUE_KEYS: readonly PersonalValueKey[] = PERSONAL_VALUE_KEYS;

/**
 * SLICE V1 RUNTIME DECISION — DEMO_HELP_ELDERLY_IMMEDIATE magnitudes.
 * Pack lists effect types with magnitude TBD; +1/+1 approved for this slice only.
 */
export const SLICE_DEMO_HELP_EFFECTS = {
  sympathy: 1,
  reputation: 1,
  health: 1,
  civicParticipation: 1,
} as const;

/**
 * SLICE V1.1 RUNTIME DECISION — DEMO_IGNORE_ELDERLY magnitudes.
 * Pack lists empty effect set; no personal value changes at runtime.
 */
export const SLICE_DEMO_IGNORE_EFFECTS = {
  sympathy: 0,
  reputation: 0,
} as const;

/**
 * B.2-B RUNTIME DECISION — DEMO_STEAL_WALLET_IMMEDIATE personal magnitudes.
 * Pack lists magnitudes TBD; -1/-1 approved for this slice only.
 */
export const SLICE_DEMO_STEAL_EFFECTS = {
  sympathy: -1,
  reputation: -1,
} as const;

/** Progression default from progression_main_v1/catalog.yaml */
export const SLICE_DEFAULT_LEVEL_ID = 'main_L01';
export const SLICE_DEFAULT_LEVEL = 1;

/** Demo task content (from task_main_v1/definitions.yaml — read-only mirror for API responses). */
export const SLICE_DEMO_TASK_CONTENT = {
  taskId: SLICE_DEMO_TASK_DEFINITION_ID,
  title: 'Signora anziana al parco',
  description: 'Vedi una signora anziana che deve attraversare la strada.',
  helpLabel: 'La aiuti',
  ignoreLabel: 'La ignori',
  stealWalletLabel: 'Le rubi il portafoglio',
} as const;

/** Response messageKeys — no approved pack template; slice-specific. */
export const SLICE_DEMO_HELP_MESSAGE_KEY = 'slice.task.demo_elderly.help.completed';
export const SLICE_DEMO_IGNORE_MESSAGE_KEY = 'slice.task.demo_elderly.ignore.completed';
export const SLICE_DEMO_STEAL_MESSAGE_KEY = 'slice.task.demo_elderly.steal_wallet.completed';
