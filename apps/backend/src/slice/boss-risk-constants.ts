import {
  DEMO_BOSS_LATE_END_NEGATIVE,
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
} from './boss-dialogue-constants.js';
import {
  DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED,
  DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
  DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
} from './risk-constants.js';

/**
 * C.1 / V1-DIALOGUE-1 — boss risk on negative dialogue conclusion only (demo placeholder).
 */

export const DEMO_BOSS_NEGATIVE_END_RISK_REF = 'DEMO_BOSS_NEGATIVE_END_RISK';

export const DEMO_BOSS_NEGATIVE_END_RISK_BRANCHES = [
  { branchId: DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN, weight: 70 },
  { branchId: DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED, weight: 30 },
] as const;

export const DEMO_BOSS_RISK_RESOLUTION_VERSION = 1;

export const DEMO_BOSS_RISK_MESSAGE_KEYS = {
  [DEMO_BOSS_NEGATIVE_END_RISK_REF]: {
    [DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED]:
      'slice.task.demo_boss.late.end_negative.risk.witnessed',
  },
} as const;

export const DEMO_BOSS_NEGATIVE_END_RISK_REGISTRATION = {
  definitionId: DEMO_BOSS_LATE_END_NEGATIVE,
  optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
  spec: {
    riskSpecRef: DEMO_BOSS_NEGATIVE_END_RISK_REF,
    exposureLevel: 'low' as const,
    branches: [...DEMO_BOSS_NEGATIVE_END_RISK_BRANCHES],
    executionOrder: 'post_deterministic_effects' as const,
    resolutionVersion: DEMO_BOSS_RISK_RESOLUTION_VERSION,
  },
};

export {
  DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED,
  DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
  DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
};
