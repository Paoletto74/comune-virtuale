import { describe, expect, it } from 'vitest';
import { defaultEffectRegistry } from '../application/effects/effect-registry.js';
import { getDialogueNext, isDialogueDefinition } from '../slice/dialogue-routing.js';
import { DEMO_BOSS_DIALOGUE_TERMINAL_OPTION } from '../slice/boss-dialogue-constants.js';
import {
  DEMO_LANDLORD_END_POSITIVE,
  DEMO_LANDLORD_GREETING_DEFINITION_ID,
  DEMO_LANDLORD_S2B,
  LANDLORD_DIALOGUE_PATH_POSITIVE,
  FRIEND_DEBT_DIALOGUE_PATH_LEND,
  FRIEND_DEBT_DIALOGUE_PATH_POSITIVE,
  DEMO_FRIEND_DEBT_GREETING_DEFINITION_ID,
  DEMO_FRIEND_DEBT_END_LEND,
  DEMO_FRIEND_DEBT_END_POSITIVE,
} from '../slice/variety-dialogue-constants.js';

describe('V1-CONTENT-VARIETY-1 dialogues', () => {
  it('routes landlord dialogue to positive terminal', () => {
    expect(isDialogueDefinition(DEMO_LANDLORD_GREETING_DEFINITION_ID)).toBe(true);

    let nodeId: string | null = DEMO_LANDLORD_GREETING_DEFINITION_ID;
    for (const optionId of LANDLORD_DIALOGUE_PATH_POSITIVE.slice(0, -1)) {
      nodeId = getDialogueNext(nodeId!, optionId);
      expect(nodeId).toBeTruthy();
    }
    expect(nodeId).toBe(DEMO_LANDLORD_END_POSITIVE);
    expect(getDialogueNext(DEMO_LANDLORD_S2B, 'offer_payment_plan')).toBe(DEMO_LANDLORD_END_POSITIVE);
  });

  it('routes friend debt lend path to terminal with economic effect', () => {
    let nodeId: string | null = DEMO_FRIEND_DEBT_GREETING_DEFINITION_ID;
    for (const optionId of FRIEND_DEBT_DIALOGUE_PATH_LEND.slice(0, -1)) {
      nodeId = getDialogueNext(nodeId!, optionId);
      expect(nodeId).toBeTruthy();
    }
    expect(nodeId).toBe(DEMO_FRIEND_DEBT_END_LEND);

    const terminal = defaultEffectRegistry.resolve({
      definitionId: DEMO_FRIEND_DEBT_END_LEND,
      optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(terminal.economic.kind).toBe('cash_delta');
  });

  it('routes friend debt positive path without cash effect', () => {
    let nodeId: string | null = DEMO_FRIEND_DEBT_GREETING_DEFINITION_ID;
    for (const optionId of FRIEND_DEBT_DIALOGUE_PATH_POSITIVE.slice(0, -1)) {
      nodeId = getDialogueNext(nodeId!, optionId);
      expect(nodeId).toBeTruthy();
    }
    expect(nodeId).toBe(DEMO_FRIEND_DEBT_END_POSITIVE);

    const terminal = defaultEffectRegistry.resolve({
      definitionId: DEMO_FRIEND_DEBT_END_POSITIVE,
      optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
      taskInstanceId: 't1',
      citizenId: 'c1',
      context: {},
    });
    expect(terminal.economic).toEqual({ kind: 'none' });
    expect(terminal.personalValues.sympathy).toBeGreaterThan(0);
  });
});
