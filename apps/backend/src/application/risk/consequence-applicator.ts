import {
  DEMO_BOSS_NEGATIVE_END_RISK_REF,
  DEMO_BOSS_RISK_MESSAGE_KEYS,
} from '../../slice/boss-risk-constants.js';
import {
  DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN,
  DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED,
  DEMO_STEAL_WALLET_RISK_MESSAGE_KEYS,
  DEMO_STEAL_WALLET_RISK_REF,
} from '../../slice/risk-constants.js';
import {
  OFF_BOOK_RISK_MESSAGE_KEYS,
  OFF_BOOK_RISK_SPEC_REFS,
  THEFT_RISK_MESSAGE_KEYS,
  THEFT_RISK_SPEC_REFS,
} from '../../slice/theft-risk-constants.js';
import type { ConsequenceApplyInput, ConsequenceApplyResult } from './risk-types.js';

const STEAL_WALLET_VISIBILITY: Record<string, 'visible' | 'hidden'> = {
  [DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED]: 'hidden',
};

const BOSS_RISK_VISIBILITY: Record<string, Record<string, 'visible' | 'hidden'>> = {
  [DEMO_BOSS_NEGATIVE_END_RISK_REF]: {
    [DEMO_STEAL_WALLET_RISK_BRANCH_WITNESSED]: 'visible',
  },
};

/**
 * Applies narrative-only branch consequences — no persistent penalties.
 */
export class ConsequenceApplier {
  async apply(input: ConsequenceApplyInput): Promise<ConsequenceApplyResult> {
    if (input.branchId === DEMO_STEAL_WALLET_RISK_BRANCH_UNSEEN) {
      return { applied: false, consequenceRefs: [] };
    }

    let messageKey: string | undefined;
    if (input.riskSpecRef === DEMO_STEAL_WALLET_RISK_REF) {
      messageKey =
        DEMO_STEAL_WALLET_RISK_MESSAGE_KEYS[
          input.branchId as keyof typeof DEMO_STEAL_WALLET_RISK_MESSAGE_KEYS
        ];
    } else if (OFF_BOOK_RISK_SPEC_REFS.has(input.riskSpecRef)) {
      messageKey =
        OFF_BOOK_RISK_MESSAGE_KEYS[input.branchId as keyof typeof OFF_BOOK_RISK_MESSAGE_KEYS];
    } else if (THEFT_RISK_SPEC_REFS.has(input.riskSpecRef)) {
      messageKey =
        THEFT_RISK_MESSAGE_KEYS[input.branchId as keyof typeof THEFT_RISK_MESSAGE_KEYS];
    } else {
      const bossMessages =
        DEMO_BOSS_RISK_MESSAGE_KEYS[input.riskSpecRef as keyof typeof DEMO_BOSS_RISK_MESSAGE_KEYS];
      messageKey = bossMessages?.[input.branchId as keyof typeof bossMessages];
    }

    if (!messageKey) {
      return { applied: false, consequenceRefs: [] };
    }

    const visibility =
      STEAL_WALLET_VISIBILITY[input.branchId] ??
      BOSS_RISK_VISIBILITY[input.riskSpecRef]?.[input.branchId] ??
      'visible';

    return {
      applied: true,
      consequenceRefs: [input.branchId],
      messageKey,
      visibility,
    };
  }
}

export const defaultConsequenceApplicator = new ConsequenceApplier();
