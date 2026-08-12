import {
  DEMO_STEAL_WALLET_RISK_BRANCHES,
  DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED,
  DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
  DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
} from './risk-constants.js';
import { DEMO_FOUND_WALLET_DEFINITION_ID, DEMO_FOUND_WALLET_OPTION_KEEP } from './c3-pilot-tasks-constants.js';
import { DEMO_SHADY_OFFER_DEFINITION_ID, DEMO_SHADY_OPTION_BUY } from './variety-content-constants.js';

export {
  DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
  DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
  DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED,
};

/** Shared branch weights for slice theft / borderline economic choices. */
export const THEFT_RISK_BRANCHES = [...DEMO_STEAL_WALLET_RISK_BRANCHES];

export const THEFT_RISK_MESSAGE_KEYS = {
  [DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED]: 'slice.task.theft.risk.witnessed',
  [DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED]: 'slice.task.theft.risk.identified',
} as const;

export const OFF_BOOK_RISK_MESSAGE_KEYS = {
  [DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED]: 'slice.task.v3.risk.off_book.audit',
  [DEMO_STEAL_WALLET_RISK_BRANCH_IDENTIFIED]: 'slice.task.v3.risk.off_book.penalty',
} as const;

const THEFT_RISK_RESOLUTION_VERSION = 1;

function createTheftRiskRegistration(
  definitionId: string,
  optionId: string,
  riskSpecRef: string,
  exposureLevel: 'medium' | 'high' = 'medium',
) {
  return {
    definitionId,
    optionId,
    spec: {
      riskSpecRef,
      exposureLevel,
      branches: [...THEFT_RISK_BRANCHES],
      executionOrder: 'post_deterministic_effects' as const,
      resolutionVersion: THEFT_RISK_RESOLUTION_VERSION,
    },
  };
}

export const DEMO_FOUND_WALLET_KEEP_RISK_REF = 'DEMO_FOUND_WALLET_KEEP_RISK';
export const DEMO_V2_FOUND_PHONE_KEEP_RISK_REF = 'DEMO_V2_FOUND_PHONE_KEEP_RISK';
export const DEMO_V3_PARKED_WALLET_TAKE_RISK_REF = 'DEMO_V3_PARKED_WALLET_TAKE_RISK';
export const DEMO_SHADY_BUY_RISK_REF = 'DEMO_SHADY_BUY_RISK';
export const DEMO_V3_OFF_BOOK_JOB_RISK_REF = 'DEMO_V3_OFF_BOOK_JOB_RISK';

export const DEMO_FOUND_WALLET_KEEP_RISK_REGISTRATION = createTheftRiskRegistration(
  DEMO_FOUND_WALLET_DEFINITION_ID,
  DEMO_FOUND_WALLET_OPTION_KEEP,
  DEMO_FOUND_WALLET_KEEP_RISK_REF,
);

export const DEMO_V2_FOUND_PHONE_KEEP_RISK_REGISTRATION = createTheftRiskRegistration(
  'DEMO_V2_FOUND_PHONE',
  'keep',
  DEMO_V2_FOUND_PHONE_KEEP_RISK_REF,
);

export const DEMO_V3_PARKED_WALLET_TAKE_RISK_REGISTRATION = createTheftRiskRegistration(
  'DEMO_V3_RISKY_PARKED_WALLET',
  'take',
  DEMO_V3_PARKED_WALLET_TAKE_RISK_REF,
  'high',
);

export const DEMO_SHADY_BUY_RISK_REGISTRATION = createTheftRiskRegistration(
  DEMO_SHADY_OFFER_DEFINITION_ID,
  DEMO_SHADY_OPTION_BUY,
  DEMO_SHADY_BUY_RISK_REF,
);

export const DEMO_V3_OFF_BOOK_JOB_RISK_REGISTRATION = createTheftRiskRegistration(
  'DEMO_V3_RISKY_OFF_BOOK_JOB',
  'accept',
  DEMO_V3_OFF_BOOK_JOB_RISK_REF,
);

export const ALL_THEFT_RISK_REGISTRATIONS = [
  DEMO_FOUND_WALLET_KEEP_RISK_REGISTRATION,
  DEMO_V2_FOUND_PHONE_KEEP_RISK_REGISTRATION,
  DEMO_V3_PARKED_WALLET_TAKE_RISK_REGISTRATION,
  DEMO_SHADY_BUY_RISK_REGISTRATION,
  DEMO_V3_OFF_BOOK_JOB_RISK_REGISTRATION,
] as const;

export const THEFT_RISK_SPEC_REFS = new Set<string>([
  DEMO_FOUND_WALLET_KEEP_RISK_REF,
  DEMO_V2_FOUND_PHONE_KEEP_RISK_REF,
  DEMO_V3_PARKED_WALLET_TAKE_RISK_REF,
  DEMO_SHADY_BUY_RISK_REF,
]);

export const OFF_BOOK_RISK_SPEC_REFS = new Set<string>([DEMO_V3_OFF_BOOK_JOB_RISK_REF]);
