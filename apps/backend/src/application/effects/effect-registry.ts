import type { EffectBundle, EffectResolutionInput } from './effect-types.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';
import {
  DEMO_BOSS_LATE_END_NEGATIVE,
  DEMO_BOSS_LATE_END_NEUTRAL,
  DEMO_BOSS_LATE_END_POSITIVE,
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
  DEMO_BOSS_LATE_END_NEGATIVE_EFFECTS,
  DEMO_BOSS_LATE_END_NEUTRAL_EFFECTS,
  DEMO_BOSS_LATE_END_POSITIVE_EFFECTS,
  DEMO_BOSS_LATE_END_NEGATIVE_MESSAGE_KEY,
  DEMO_BOSS_LATE_END_NEUTRAL_MESSAGE_KEY,
  DEMO_BOSS_LATE_END_POSITIVE_MESSAGE_KEY,
} from '../../slice/boss-dialogue-constants.js';
import {
  DEMO_FOUND_WALLET_DEFINITION_ID,
  DEMO_FOUND_WALLET_KEEP_CASH_DELTA_MINOR,
  DEMO_FOUND_WALLET_KEEP_CASH_REASON,
  DEMO_FOUND_WALLET_KEEP_CASH_TRANSACTION_CLASS,
  DEMO_FOUND_WALLET_KEEP_CASH_TRANSACTION_TYPE,
  DEMO_FOUND_WALLET_KEEP_MESSAGE_KEY,
  DEMO_FOUND_WALLET_OPTION_KEEP,
  DEMO_FOUND_WALLET_OPTION_RETURN,
  DEMO_FOUND_WALLET_RETURN_MESSAGE_KEY,
  DEMO_NEIGHBOR_FAVOR_DEFINITION_ID,
  DEMO_NEIGHBOR_HELP_MESSAGE_KEY,
  DEMO_NEIGHBOR_IGNORE_MESSAGE_KEY,
  DEMO_NEIGHBOR_OPTION_HELP,
  DEMO_NEIGHBOR_OPTION_IGNORE,
  DEMO_SUITCASE_ACCEPT_MESSAGE_KEY,
  DEMO_SUITCASE_ASK_CONTENTS_MESSAGE_KEY,
  DEMO_SUITCASE_OFFER_DEFINITION_ID,
  DEMO_SUITCASE_OPTION_ACCEPT,
  DEMO_SUITCASE_OPTION_ASK_CONTENTS,
  DEMO_SUITCASE_OPTION_REFUSE,
  DEMO_SUITCASE_REFUSE_MESSAGE_KEY,
} from '../../slice/c3-pilot-tasks-constants.js';
import {
  DEMO_ACQUAINTANCE_FAVOR_DEFINITION_ID,
  DEMO_ACQUAINTANCE_FAVOR_MESSAGE_KEYS,
  DEMO_ACQUAINTANCE_OPTION_HELP,
  DEMO_ACQUAINTANCE_OPTION_POLITE_NO,
  DEMO_ACQUAINTANCE_OPTION_RUDE_NO,
  DEMO_CHARITY_COLLECTOR_DEFINITION_ID,
  DEMO_CHARITY_COLLECTOR_MESSAGE_KEYS,
  DEMO_CHARITY_DONATE_CASH_DELTA_MINOR,
  DEMO_CHARITY_DONATE_CASH_REASON,
  DEMO_CHARITY_DONATE_CASH_TRANSACTION_CLASS,
  DEMO_CHARITY_DONATE_CASH_TRANSACTION_TYPE,
  DEMO_CHARITY_OPTION_DECLINE,
  DEMO_CHARITY_OPTION_DONATE,
  DEMO_CHARITY_OPTION_IGNORE,
  DEMO_FAMILY_CHECKIN_DEFINITION_ID,
  DEMO_FAMILY_CHECKIN_MESSAGE_KEYS,
  DEMO_FAMILY_OPTION_ANSWER,
  DEMO_FAMILY_OPTION_CALLBACK,
  DEMO_FAMILY_OPTION_IGNORE,
  DEMO_SHADY_BUY_CASH_DELTA_MINOR,
  DEMO_SHADY_BUY_CASH_REASON,
  DEMO_SHADY_BUY_CASH_TRANSACTION_CLASS,
  DEMO_SHADY_BUY_CASH_TRANSACTION_TYPE,
  DEMO_SHADY_OFFER_DEFINITION_ID,
  DEMO_SHADY_OFFER_MESSAGE_KEYS,
  DEMO_SHADY_OPTION_BUY,
  DEMO_SHADY_OPTION_REFUSE,
  DEMO_SHADY_OPTION_REPORT,
  DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID,
  DEMO_WORK_COLLEAGUE_COVER_MESSAGE_KEYS,
  DEMO_WORK_COLLEAGUE_OPTION_COVER,
  DEMO_WORK_COLLEAGUE_OPTION_DECLINE,
  DEMO_WORK_COLLEAGUE_OPTION_REPORT,
  DEMO_WORK_SUPPLIER_DELAY_DEFINITION_ID,
  DEMO_WORK_SUPPLIER_DELAY_MESSAGE_KEYS,
  DEMO_WORK_SUPPLIER_OPTION_BLAME,
  DEMO_WORK_SUPPLIER_OPTION_FOLLOW_UP,
  DEMO_WORK_SUPPLIER_OPTION_WAIT,
} from '../../slice/variety-content-constants.js';
import {
  DEMO_FRIEND_DEBT_END_LEND,
  DEMO_FRIEND_DEBT_END_LEND_MESSAGE_KEY,
  DEMO_FRIEND_DEBT_END_NEGATIVE,
  DEMO_FRIEND_DEBT_END_NEGATIVE_MESSAGE_KEY,
  DEMO_FRIEND_DEBT_END_NEUTRAL,
  DEMO_FRIEND_DEBT_END_NEUTRAL_MESSAGE_KEY,
  DEMO_FRIEND_DEBT_END_PARTIAL,
  DEMO_FRIEND_DEBT_END_PARTIAL_MESSAGE_KEY,
  DEMO_FRIEND_DEBT_END_POSITIVE,
  DEMO_FRIEND_DEBT_END_POSITIVE_MESSAGE_KEY,
  DEMO_FRIEND_LEND_CASH_REASON,
  DEMO_FRIEND_LEND_CASH_TRANSACTION_CLASS,
  DEMO_FRIEND_LEND_CASH_TRANSACTION_TYPE,
  DEMO_FRIEND_LEND_FULL_CASH_DELTA_MINOR,
  DEMO_FRIEND_LEND_PARTIAL_CASH_DELTA_MINOR,
  DEMO_LANDLORD_END_NEGATIVE,
  DEMO_LANDLORD_END_NEGATIVE_MESSAGE_KEY,
  DEMO_LANDLORD_END_NEUTRAL,
  DEMO_LANDLORD_END_NEUTRAL_MESSAGE_KEY,
  DEMO_LANDLORD_END_POSITIVE,
  DEMO_LANDLORD_END_POSITIVE_MESSAGE_KEY,
} from '../../slice/variety-dialogue-constants.js';
import { VARIETY_V2_STANDARD_TASKS, varietyV2CashEffect } from '../../slice/variety-content-v2-constants.js';
import { NPC_CONSEQUENCE_TASKS } from '../../slice/npc-relationship-consequences-constants.js';
import { VARIETY_V3_STANDARD_TASKS, varietyV3CashEffect } from '../../slice/variety-content-v3-constants.js';
import { ANTI_STALL_STANDARD_TASKS } from '../../slice/anti-stall-tasks-constants.js';
import { VARIETY_V2_DIALOGUE_TERMINAL_EFFECTS } from '../../slice/variety-dialogue-v2-constants.js';
import { VARIETY_V3_DIALOGUE_TERMINAL_EFFECTS } from '../../slice/variety-dialogue-v3-constants.js';
import {
  SLICE_DEMO_HELP_EFFECTS,
  SLICE_DEMO_HELP_MESSAGE_KEY,
  SLICE_DEMO_IGNORE_EFFECTS,
  SLICE_DEMO_IGNORE_MESSAGE_KEY,
  SLICE_DEMO_STEAL_EFFECTS,
  SLICE_DEMO_STEAL_MESSAGE_KEY,
  SLICE_DEMO_TASK_DEFINITION_ID,
  SLICE_DEMO_TASK_OPTION_HELP,
  SLICE_DEMO_TASK_OPTION_IGNORE,
  SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
} from '../../slice/constants.js';
import {
  SLICE_STEAL_WALLET_REASON,
  SLICE_STEAL_WALLET_TRANSACTION_TYPE,
  SLICE_TRANSFER_TRANSACTION_CLASS,
} from '../../slice/economy-constants.js';
import {
  enrichTaskPersonalValues,
  type PersonalValuePartial,
} from '../../slice/task-personal-value-enrichment.js';

type EffectResolver = (input: EffectResolutionInput) => EffectBundle;

function taskPersonalValues(
  definitionId: string,
  optionId: string,
  partial: PersonalValuePartial,
): PersonalValuePartial {
  return enrichTaskPersonalValues(definitionId, optionId, partial);
}

function registryKey(definitionId: string, optionId: string): string {
  return `${definitionId}:${optionId}`;
}

export class EffectRegistry {
  private readonly resolvers = new Map<string, EffectResolver>();

  register(definitionId: string, optionId: string, resolver: EffectResolver): void {
    this.resolvers.set(registryKey(definitionId, optionId), resolver);
  }

  resolve(input: EffectResolutionInput): EffectBundle {
    const resolver = this.resolvers.get(registryKey(input.definitionId, input.optionId));
    if (!resolver) {
      throw new AppError('VALIDATION', 'OPTION_NOT_SUPPORTED', 'error.task.option_not_supported');
    }
    const bundle = resolver(input);
    return {
      ...bundle,
      personalValues: enrichTaskPersonalValues(
        input.definitionId,
        input.optionId,
        bundle.personalValues,
      ),
    };
  }
}

export const defaultEffectRegistry = new EffectRegistry();

function registerElderlyEffects(registry: EffectRegistry): void {
  registry.register(SLICE_DEMO_TASK_DEFINITION_ID, SLICE_DEMO_TASK_OPTION_HELP, () => ({
    messageKey: SLICE_DEMO_HELP_MESSAGE_KEY,
    personalValues: taskPersonalValues(SLICE_DEMO_TASK_DEFINITION_ID, SLICE_DEMO_TASK_OPTION_HELP, {
      ...SLICE_DEMO_HELP_EFFECTS,
    }),
    economic: { kind: 'none' },
  }));

  registry.register(SLICE_DEMO_TASK_DEFINITION_ID, SLICE_DEMO_TASK_OPTION_IGNORE, () => ({
    messageKey: SLICE_DEMO_IGNORE_MESSAGE_KEY,
    personalValues: taskPersonalValues(SLICE_DEMO_TASK_DEFINITION_ID, SLICE_DEMO_TASK_OPTION_IGNORE, {
      ...SLICE_DEMO_IGNORE_EFFECTS,
    }),
    economic: { kind: 'none' },
  }));

  registry.register(
    SLICE_DEMO_TASK_DEFINITION_ID,
    SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
    (input) => {
      const steal = input.context.resolvedEffects?.stealWallet;
      if (!steal) {
        throw new AppError(
          'BUSINESS',
          'STEAL_WALLET_NOT_RESOLVED',
          'error.task.steal_wallet_not_resolved',
        );
      }

      return {
        messageKey: SLICE_DEMO_STEAL_MESSAGE_KEY,
        personalValues: taskPersonalValues(
          SLICE_DEMO_TASK_DEFINITION_ID,
          SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
          { ...SLICE_DEMO_STEAL_EFFECTS },
        ),
        economic: {
          kind: 'transfer',
          from: steal.from,
          to: steal.to,
          amountMinor: BigInt(steal.requestedAmountMinor),
          transactionType: SLICE_STEAL_WALLET_TRANSACTION_TYPE,
          transactionClass: SLICE_TRANSFER_TRANSACTION_CLASS,
          reasonCode: SLICE_STEAL_WALLET_REASON,
        },
      };
    },
  );
}

function registerBossDialogueEffects(registry: EffectRegistry): void {
  registry.register(DEMO_BOSS_LATE_END_POSITIVE, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
    messageKey: DEMO_BOSS_LATE_END_POSITIVE_MESSAGE_KEY,
    personalValues: { ...DEMO_BOSS_LATE_END_POSITIVE_EFFECTS },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_BOSS_LATE_END_NEUTRAL, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
    messageKey: DEMO_BOSS_LATE_END_NEUTRAL_MESSAGE_KEY,
    personalValues: { ...DEMO_BOSS_LATE_END_NEUTRAL_EFFECTS },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_BOSS_LATE_END_NEGATIVE, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
    messageKey: DEMO_BOSS_LATE_END_NEGATIVE_MESSAGE_KEY,
    personalValues: { ...DEMO_BOSS_LATE_END_NEGATIVE_EFFECTS },
    economic: { kind: 'none' },
  }));
}

function registerC3PilotEffects(registry: EffectRegistry): void {
  registry.register(DEMO_NEIGHBOR_FAVOR_DEFINITION_ID, DEMO_NEIGHBOR_OPTION_HELP, () => ({
    messageKey: DEMO_NEIGHBOR_HELP_MESSAGE_KEY,
    personalValues: { sympathy: 1, reputation: 0 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_NEIGHBOR_FAVOR_DEFINITION_ID, DEMO_NEIGHBOR_OPTION_IGNORE, () => ({
    messageKey: DEMO_NEIGHBOR_IGNORE_MESSAGE_KEY,
    personalValues: { sympathy: 0, reputation: 0 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_SUITCASE_OFFER_DEFINITION_ID, DEMO_SUITCASE_OPTION_ACCEPT, () => ({
    messageKey: DEMO_SUITCASE_ACCEPT_MESSAGE_KEY,
    personalValues: { sympathy: 0, reputation: -1 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_SUITCASE_OFFER_DEFINITION_ID, DEMO_SUITCASE_OPTION_REFUSE, () => ({
    messageKey: DEMO_SUITCASE_REFUSE_MESSAGE_KEY,
    personalValues: { sympathy: 0, reputation: 1 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_SUITCASE_OFFER_DEFINITION_ID, DEMO_SUITCASE_OPTION_ASK_CONTENTS, () => ({
    messageKey: DEMO_SUITCASE_ASK_CONTENTS_MESSAGE_KEY,
    personalValues: { sympathy: 0, reputation: 0 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_FOUND_WALLET_DEFINITION_ID, DEMO_FOUND_WALLET_OPTION_RETURN, () => ({
    messageKey: DEMO_FOUND_WALLET_RETURN_MESSAGE_KEY,
    personalValues: { sympathy: 0, reputation: 1 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_FOUND_WALLET_DEFINITION_ID, DEMO_FOUND_WALLET_OPTION_KEEP, () => ({
    messageKey: DEMO_FOUND_WALLET_KEEP_MESSAGE_KEY,
    personalValues: { sympathy: 0, reputation: -2 },
    economic: {
      kind: 'cash_delta',
      deltaMinor: DEMO_FOUND_WALLET_KEEP_CASH_DELTA_MINOR,
      transactionType: DEMO_FOUND_WALLET_KEEP_CASH_TRANSACTION_TYPE,
      transactionClass: DEMO_FOUND_WALLET_KEEP_CASH_TRANSACTION_CLASS,
      reasonCode: DEMO_FOUND_WALLET_KEEP_CASH_REASON,
    },
  }));
}

function registerVarietyStandardEffects(registry: EffectRegistry): void {
  registry.register(DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID, DEMO_WORK_COLLEAGUE_OPTION_COVER, () => ({
    messageKey: DEMO_WORK_COLLEAGUE_COVER_MESSAGE_KEYS[DEMO_WORK_COLLEAGUE_OPTION_COVER],
    personalValues: { sympathy: 1, reputation: 0 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID, DEMO_WORK_COLLEAGUE_OPTION_DECLINE, () => ({
    messageKey: DEMO_WORK_COLLEAGUE_COVER_MESSAGE_KEYS[DEMO_WORK_COLLEAGUE_OPTION_DECLINE],
    personalValues: { sympathy: 0, reputation: 0 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_WORK_COLLEAGUE_COVER_DEFINITION_ID, DEMO_WORK_COLLEAGUE_OPTION_REPORT, () => ({
    messageKey: DEMO_WORK_COLLEAGUE_COVER_MESSAGE_KEYS[DEMO_WORK_COLLEAGUE_OPTION_REPORT],
    personalValues: { sympathy: -1, reputation: 1 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_WORK_SUPPLIER_DELAY_DEFINITION_ID, DEMO_WORK_SUPPLIER_OPTION_FOLLOW_UP, () => ({
    messageKey: DEMO_WORK_SUPPLIER_DELAY_MESSAGE_KEYS[DEMO_WORK_SUPPLIER_OPTION_FOLLOW_UP],
    personalValues: { sympathy: 0, reputation: 1 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_WORK_SUPPLIER_DELAY_DEFINITION_ID, DEMO_WORK_SUPPLIER_OPTION_WAIT, () => ({
    messageKey: DEMO_WORK_SUPPLIER_DELAY_MESSAGE_KEYS[DEMO_WORK_SUPPLIER_OPTION_WAIT],
    personalValues: { sympathy: 1, reputation: 0 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_WORK_SUPPLIER_DELAY_DEFINITION_ID, DEMO_WORK_SUPPLIER_OPTION_BLAME, () => ({
    messageKey: DEMO_WORK_SUPPLIER_DELAY_MESSAGE_KEYS[DEMO_WORK_SUPPLIER_OPTION_BLAME],
    personalValues: { sympathy: 0, reputation: -1 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_FAMILY_CHECKIN_DEFINITION_ID, DEMO_FAMILY_OPTION_ANSWER, () => ({
    messageKey: DEMO_FAMILY_CHECKIN_MESSAGE_KEYS[DEMO_FAMILY_OPTION_ANSWER],
    personalValues: { sympathy: 1, reputation: 1 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_FAMILY_CHECKIN_DEFINITION_ID, DEMO_FAMILY_OPTION_CALLBACK, () => ({
    messageKey: DEMO_FAMILY_CHECKIN_MESSAGE_KEYS[DEMO_FAMILY_OPTION_CALLBACK],
    personalValues: { sympathy: 0, reputation: -1 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_FAMILY_CHECKIN_DEFINITION_ID, DEMO_FAMILY_OPTION_IGNORE, () => ({
    messageKey: DEMO_FAMILY_CHECKIN_MESSAGE_KEYS[DEMO_FAMILY_OPTION_IGNORE],
    personalValues: { sympathy: -1, reputation: 0 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_ACQUAINTANCE_FAVOR_DEFINITION_ID, DEMO_ACQUAINTANCE_OPTION_HELP, () => ({
    messageKey: DEMO_ACQUAINTANCE_FAVOR_MESSAGE_KEYS[DEMO_ACQUAINTANCE_OPTION_HELP],
    personalValues: { sympathy: 1, reputation: 1 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_ACQUAINTANCE_FAVOR_DEFINITION_ID, DEMO_ACQUAINTANCE_OPTION_POLITE_NO, () => ({
    messageKey: DEMO_ACQUAINTANCE_FAVOR_MESSAGE_KEYS[DEMO_ACQUAINTANCE_OPTION_POLITE_NO],
    personalValues: { sympathy: 0, reputation: 0 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_ACQUAINTANCE_FAVOR_DEFINITION_ID, DEMO_ACQUAINTANCE_OPTION_RUDE_NO, () => ({
    messageKey: DEMO_ACQUAINTANCE_FAVOR_MESSAGE_KEYS[DEMO_ACQUAINTANCE_OPTION_RUDE_NO],
    personalValues: { sympathy: -1, reputation: -1 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_SHADY_OFFER_DEFINITION_ID, DEMO_SHADY_OPTION_BUY, () => ({
    messageKey: DEMO_SHADY_OFFER_MESSAGE_KEYS[DEMO_SHADY_OPTION_BUY],
    personalValues: { sympathy: 0, reputation: -2 },
    economic: {
      kind: 'cash_delta',
      deltaMinor: DEMO_SHADY_BUY_CASH_DELTA_MINOR,
      transactionType: DEMO_SHADY_BUY_CASH_TRANSACTION_TYPE,
      transactionClass: DEMO_SHADY_BUY_CASH_TRANSACTION_CLASS,
      reasonCode: DEMO_SHADY_BUY_CASH_REASON,
    },
  }));
  registry.register(DEMO_SHADY_OFFER_DEFINITION_ID, DEMO_SHADY_OPTION_REFUSE, () => ({
    messageKey: DEMO_SHADY_OFFER_MESSAGE_KEYS[DEMO_SHADY_OPTION_REFUSE],
    personalValues: { sympathy: 0, reputation: 1 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_SHADY_OFFER_DEFINITION_ID, DEMO_SHADY_OPTION_REPORT, () => ({
    messageKey: DEMO_SHADY_OFFER_MESSAGE_KEYS[DEMO_SHADY_OPTION_REPORT],
    personalValues: { sympathy: 0, reputation: 1 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_CHARITY_COLLECTOR_DEFINITION_ID, DEMO_CHARITY_OPTION_DONATE, () => ({
    messageKey: DEMO_CHARITY_COLLECTOR_MESSAGE_KEYS[DEMO_CHARITY_OPTION_DONATE],
    personalValues: { sympathy: 1, reputation: 1 },
    economic: {
      kind: 'cash_delta',
      deltaMinor: DEMO_CHARITY_DONATE_CASH_DELTA_MINOR,
      transactionType: DEMO_CHARITY_DONATE_CASH_TRANSACTION_TYPE,
      transactionClass: DEMO_CHARITY_DONATE_CASH_TRANSACTION_CLASS,
      reasonCode: DEMO_CHARITY_DONATE_CASH_REASON,
    },
  }));
  registry.register(DEMO_CHARITY_COLLECTOR_DEFINITION_ID, DEMO_CHARITY_OPTION_DECLINE, () => ({
    messageKey: DEMO_CHARITY_COLLECTOR_MESSAGE_KEYS[DEMO_CHARITY_OPTION_DECLINE],
    personalValues: { sympathy: 0, reputation: 0 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_CHARITY_COLLECTOR_DEFINITION_ID, DEMO_CHARITY_OPTION_IGNORE, () => ({
    messageKey: DEMO_CHARITY_COLLECTOR_MESSAGE_KEYS[DEMO_CHARITY_OPTION_IGNORE],
    personalValues: { sympathy: 0, reputation: 0 },
    economic: { kind: 'none' },
  }));
}

function registerVarietyDialogueEffects(registry: EffectRegistry): void {
  registry.register(DEMO_LANDLORD_END_POSITIVE, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
    messageKey: DEMO_LANDLORD_END_POSITIVE_MESSAGE_KEY,
    personalValues: { sympathy: 0, reputation: 1 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_LANDLORD_END_NEUTRAL, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
    messageKey: DEMO_LANDLORD_END_NEUTRAL_MESSAGE_KEY,
    personalValues: { sympathy: 0, reputation: 0 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_LANDLORD_END_NEGATIVE, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
    messageKey: DEMO_LANDLORD_END_NEGATIVE_MESSAGE_KEY,
    personalValues: { sympathy: 0, reputation: -1 },
    economic: { kind: 'none' },
  }));

  registry.register(DEMO_FRIEND_DEBT_END_LEND, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
    messageKey: DEMO_FRIEND_DEBT_END_LEND_MESSAGE_KEY,
    personalValues: { sympathy: 1, reputation: 0 },
    economic: {
      kind: 'cash_delta',
      deltaMinor: DEMO_FRIEND_LEND_FULL_CASH_DELTA_MINOR,
      transactionType: DEMO_FRIEND_LEND_CASH_TRANSACTION_TYPE,
      transactionClass: DEMO_FRIEND_LEND_CASH_TRANSACTION_CLASS,
      reasonCode: DEMO_FRIEND_LEND_CASH_REASON,
    },
  }));
  registry.register(DEMO_FRIEND_DEBT_END_PARTIAL, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
    messageKey: DEMO_FRIEND_DEBT_END_PARTIAL_MESSAGE_KEY,
    personalValues: { sympathy: 1, reputation: 0 },
    economic: {
      kind: 'cash_delta',
      deltaMinor: DEMO_FRIEND_LEND_PARTIAL_CASH_DELTA_MINOR,
      transactionType: DEMO_FRIEND_LEND_CASH_TRANSACTION_TYPE,
      transactionClass: DEMO_FRIEND_LEND_CASH_TRANSACTION_CLASS,
      reasonCode: DEMO_FRIEND_LEND_CASH_REASON,
    },
  }));
  registry.register(DEMO_FRIEND_DEBT_END_POSITIVE, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
    messageKey: DEMO_FRIEND_DEBT_END_POSITIVE_MESSAGE_KEY,
    personalValues: { sympathy: 1, reputation: 1 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_FRIEND_DEBT_END_NEUTRAL, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
    messageKey: DEMO_FRIEND_DEBT_END_NEUTRAL_MESSAGE_KEY,
    personalValues: { sympathy: 0, reputation: 0 },
    economic: { kind: 'none' },
  }));
  registry.register(DEMO_FRIEND_DEBT_END_NEGATIVE, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
    messageKey: DEMO_FRIEND_DEBT_END_NEGATIVE_MESSAGE_KEY,
    personalValues: { sympathy: -1, reputation: 0 },
    economic: { kind: 'none' },
  }));
}

function registerVarietyV2StandardEffects(registry: EffectRegistry): void {
  for (const task of VARIETY_V2_STANDARD_TASKS) {
    for (const option of task.options) {
      const { optionId } = option;
      const effects = task.effects[optionId] ?? {};
      const messageKey = task.messageKeys[optionId]!;
      registry.register(task.definitionId, optionId, () => ({
        messageKey,
        personalValues: taskPersonalValues(task.definitionId, optionId, effects as PersonalValuePartial),
        economic:
          effects.cashDeltaMinor !== undefined && effects.cashReason
            ? varietyV2CashEffect(effects.cashDeltaMinor, effects.cashReason)
            : { kind: 'none' },
      }));
    }
  }
}

function registerVarietyV2DialogueEffects(registry: EffectRegistry): void {
  for (const [definitionId, effect] of Object.entries(VARIETY_V2_DIALOGUE_TERMINAL_EFFECTS)) {
    registry.register(definitionId, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
      messageKey: effect.messageKey,
      personalValues: {
        sympathy: effect.sympathy ?? 0,
        reputation: effect.reputation ?? 0,
      },
      economic:
        effect.cashDeltaMinor !== undefined && effect.cashReason
          ? varietyV2CashEffect(effect.cashDeltaMinor, effect.cashReason)
          : { kind: 'none' },
    }));
  }
}

function registerVarietyV3StandardEffects(registry: EffectRegistry): void {
  for (const task of VARIETY_V3_STANDARD_TASKS) {
    for (const option of task.options) {
      const { optionId } = option;
      const effects = task.effects[optionId] ?? {};
      const messageKey = task.messageKeys[optionId]!;
      registry.register(task.definitionId, optionId, () => ({
        messageKey,
        personalValues: {
          sympathy: effects.sympathy ?? 0,
          reputation: effects.reputation ?? 0,
        },
        economic:
          effects.cashDeltaMinor !== undefined && effects.cashReason
            ? varietyV3CashEffect(effects.cashDeltaMinor, effects.cashReason)
            : { kind: 'none' },
      }));
    }
  }
}

function registerVarietyV3DialogueEffects(registry: EffectRegistry): void {
  for (const [definitionId, effect] of Object.entries(VARIETY_V3_DIALOGUE_TERMINAL_EFFECTS)) {
    registry.register(definitionId, DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, () => ({
      messageKey: effect.messageKey,
      personalValues: {
        sympathy: effect.sympathy ?? 0,
        reputation: effect.reputation ?? 0,
      },
      economic:
        effect.cashDeltaMinor !== undefined && effect.cashReason
          ? varietyV3CashEffect(effect.cashDeltaMinor, effect.cashReason)
          : { kind: 'none' },
    }));
  }
}

function registerNpcConsequenceEffects(registry: EffectRegistry): void {
  for (const task of NPC_CONSEQUENCE_TASKS) {
    for (const option of task.options) {
      const { optionId } = option;
      const effects = task.effects[optionId] ?? {};
      const messageKey = task.messageKeys[optionId]!;
      registry.register(task.definitionId, optionId, () => ({
        messageKey,
        personalValues: taskPersonalValues(task.definitionId, optionId, effects as PersonalValuePartial),
        economic:
          effects.cashDeltaMinor !== undefined && effects.cashReason
            ? varietyV2CashEffect(effects.cashDeltaMinor, effects.cashReason)
            : { kind: 'none' },
      }));
    }
  }
}

function registerAntiStallEffects(registry: EffectRegistry): void {
  for (const task of ANTI_STALL_STANDARD_TASKS) {
    for (const option of task.options) {
      registry.register(task.definitionId, option.optionId, () => ({
        messageKey: task.messageKeys[option.optionId as keyof typeof task.messageKeys],
        personalValues: { sympathy: 1, reputation: 0 },
        economic: { kind: 'none' },
      }));
    }
  }
}

function registerSliceEffects(registry: EffectRegistry = defaultEffectRegistry): void {
  registerElderlyEffects(registry);
  registerBossDialogueEffects(registry);
  registerC3PilotEffects(registry);
  registerVarietyStandardEffects(registry);
  registerVarietyDialogueEffects(registry);
  registerVarietyV2StandardEffects(registry);
  registerVarietyV2DialogueEffects(registry);
  registerVarietyV3StandardEffects(registry);
  registerVarietyV3DialogueEffects(registry);
  registerNpcConsequenceEffects(registry);
  registerAntiStallEffects(registry);
}

registerSliceEffects();

/** @deprecated Use EffectRegistry — kept for unit tests during B.2-A refactor */
export function resolveSliceDemoOptionEffects(
  optionId:
    | typeof SLICE_DEMO_TASK_OPTION_HELP
    | typeof SLICE_DEMO_TASK_OPTION_IGNORE
    | typeof SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
) {
  const bundle = defaultEffectRegistry.resolve({
    definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
    optionId,
    taskInstanceId: 'test',
    citizenId: 'test',
    context:
      optionId === SLICE_DEMO_TASK_OPTION_STEAL_WALLET
        ? {
            resolvedEffects: {
              stealWallet: {
                effectSetRef: 'DEMO_STEAL_WALLET_IMMEDIATE',
                from: { ownerType: 'npc', ownerRef: 'npc-test' },
                to: { ownerType: 'citizen', ownerRef: 'test' },
                requestedAmountMinor: '10',
                walletAtSpawnMinor: '20',
                resolutionVersion: 1,
              },
            },
          }
        : {},
  });
  return {
    sympathy: bundle.personalValues.sympathy ?? 0,
    reputation: bundle.personalValues.reputation ?? 0,
  };
}

export function resolveSliceDemoOptionCashDelta(
  optionId:
    | typeof SLICE_DEMO_TASK_OPTION_HELP
    | typeof SLICE_DEMO_TASK_OPTION_IGNORE
    | typeof SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
): bigint {
  const bundle = defaultEffectRegistry.resolve({
    definitionId: SLICE_DEMO_TASK_DEFINITION_ID,
    optionId,
    taskInstanceId: 'test',
    citizenId: 'test',
    context:
      optionId === SLICE_DEMO_TASK_OPTION_STEAL_WALLET
        ? {
            resolvedEffects: {
              stealWallet: {
                effectSetRef: 'DEMO_STEAL_WALLET_IMMEDIATE',
                from: { ownerType: 'npc', ownerRef: 'npc-test' },
                to: { ownerType: 'citizen', ownerRef: 'test' },
                requestedAmountMinor: '10',
                walletAtSpawnMinor: '20',
                resolutionVersion: 1,
              },
            },
          }
        : {},
  });
  if (bundle.economic.kind === 'cash_delta') {
    return bundle.economic.deltaMinor;
  }
  if (bundle.economic.kind === 'transfer') {
    return bundle.economic.amountMinor;
  }
  return 0n;
}

export function applySliceDemoOptionEffects(
  values: { sympathy: number; reputation: number },
  optionId:
    | typeof SLICE_DEMO_TASK_OPTION_HELP
    | typeof SLICE_DEMO_TASK_OPTION_IGNORE
    | typeof SLICE_DEMO_TASK_OPTION_STEAL_WALLET,
) {
  const delta = resolveSliceDemoOptionEffects(optionId);
  return {
    sympathy: values.sympathy + delta.sympathy,
    reputation: values.reputation + delta.reputation,
  };
}

export function applySliceDemoHelpEffects(values: { sympathy: number; reputation: number }) {
  return applySliceDemoOptionEffects(values, SLICE_DEMO_TASK_OPTION_HELP);
}
