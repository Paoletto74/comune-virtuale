import { describe, expect, it } from 'vitest';
import {
  BOSS_DIALOGUE_NODES,
  BOSS_DIALOGUE_S1_OPTIONS,
  BOSS_DIALOGUE_S2A_OPTIONS,
  BOSS_DIALOGUE_S2B_OPTIONS,
  BOSS_DIALOGUE_S2C_OPTIONS,
  BOSS_DIALOGUE_S3_OPTIONS,
  DEMO_BOSS_DIALOGUE_STEP_IDS,
  getBossDialogueNext,
} from './boss-dialogue-constants.js';

describe('boss dialogue constants', () => {
  it('step nodes expose 3–5 options', () => {
    for (const definitionId of DEMO_BOSS_DIALOGUE_STEP_IDS) {
      const node = BOSS_DIALOGUE_NODES[definitionId];
      expect(node?.options.length).toBeGreaterThanOrEqual(3);
      expect(node?.options.length).toBeLessThanOrEqual(5);
    }
  });

  it('maps every S1 option to a next node', () => {
    for (const optionId of BOSS_DIALOGUE_S1_OPTIONS) {
      expect(getBossDialogueNext('DEMO_BOSS_GREETING', optionId)).toBeTruthy();
    }
  });

  it('maps every S2/S3 option to a next node', () => {
    for (const optionId of BOSS_DIALOGUE_S2A_OPTIONS) {
      expect(getBossDialogueNext('DEMO_BOSS_LATE_S2A', optionId)).toBeTruthy();
    }
    for (const optionId of BOSS_DIALOGUE_S2B_OPTIONS) {
      expect(getBossDialogueNext('DEMO_BOSS_LATE_S2B', optionId)).toBeTruthy();
    }
    for (const optionId of BOSS_DIALOGUE_S2C_OPTIONS) {
      expect(getBossDialogueNext('DEMO_BOSS_LATE_S2C', optionId)).toBeTruthy();
    }
    for (const optionId of BOSS_DIALOGUE_S3_OPTIONS) {
      expect(getBossDialogueNext('DEMO_BOSS_LATE_S3_MERGE', optionId)).toBeTruthy();
    }
  });
});
