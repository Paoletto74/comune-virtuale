import {
  SLICE_DEMO_TASK_DEFINITION_ID,
  SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
} from './constants.js';

/** B.3 RUNTIME DECISION — first steal_wallet risk balancing spec (slice-only, not content pack). */
export const DEMO_STEAL_WALLET_RISK_REF = 'DEMO_STEAL_WALLET_RISK';

export const DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN = 'unseen';
export const DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED = 'witnessed';
export const DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED = 'identified';

export const DEMO_STEAL_WALLET_RISK_BRANCHES = [
  { branchId: DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN, weight: 55 },
  { branchId: DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED, weight: 30 },
  { branchId: DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED, weight: 15 },
] as const;

export const DEMO_STEAL_WALLET_RISK_RESOLUTION_VERSION = 1;

/** Narrative messageKeys — slice-specific, no persistent penalties. */
export const DEMO_STEAL_WALLET_RISK_MESSAGE_KEYS = {
  [DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED]:
    'slice.task.demo_elderly.steal_wallet.risk.witnessed',
  [DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED]:
    'slice.task.demo_elderly.steal_wallet.risk.identified',
} as const;

export const DEMO_STEAL_WALLET_RISK_REGISTRATION = {
  definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
  optionId: SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
  spec: {
    riskSpecRef: DEMO_STEAL_WALLET_RISK_REF,
    exposureLevel: 'medium' as const,
    branches: [...DEMO_STEAL_WALLET_RISK_BRANCHES],
    executionOrder: 'post_deterministic_effects' as const,
    resolutionVersion: DEMO_STEAL_WALLET_RISK_RESOLUTION_VERSION,
  },
};
