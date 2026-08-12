import { DEMO_BOSS_GREETING_DEFINITION_ID } from './boss-constants.js';
import {
  getBossDialogueNext,
  isBossDialogueDefinition,
  isBossDialogueTerminal,
} from './boss-dialogue-constants.js';
import {
  getVarietyDialogueNext,
  isVarietyDialogueDefinition,
  isVarietyDialogueTerminal,
  VARIETY_DIALOGUE_ROOT_IDS,
} from './variety-dialogue-constants.js';
import {
  getVarietyV2DialogueNext,
  isVarietyV2DialogueDefinition,
  isVarietyV2DialogueTerminal,
  VARIETY_V2_DIALOGUE_ROOT_IDS,
} from './variety-dialogue-v2-constants.js';

import {
  getVarietyV3DialogueNext,
  isVarietyV3DialogueDefinition,
  isVarietyV3DialogueTerminal,
  VARIETY_V3_DIALOGUE_ROOT_IDS,
} from './variety-dialogue-v3-constants.js';
import {
  getMega1DialogueNext,
  isMega1DialogueDefinition,
  isMega1DialogueTerminal,
  MEGA1_DIALOGUE_ROOT_IDS,
} from './mega1-dialogue-routing.js';

export function getDialogueNext(definitionId: string, optionId: string): string | null {
  return (
    getBossDialogueNext(definitionId, optionId) ??
    getVarietyDialogueNext(definitionId, optionId) ??
    getVarietyV2DialogueNext(definitionId, optionId) ??
    getVarietyV3DialogueNext(definitionId, optionId) ??
    getMega1DialogueNext(definitionId, optionId)
  );
}

export function isDialogueDefinition(definitionId: string): boolean {
  return (
    isBossDialogueDefinition(definitionId) ||
    isVarietyDialogueDefinition(definitionId) ||
    isVarietyV2DialogueDefinition(definitionId) ||
    isVarietyV3DialogueDefinition(definitionId) ||
    isMega1DialogueDefinition(definitionId)
  );
}

export function isDialogueTerminal(definitionId: string): boolean {
  return (
    isBossDialogueTerminal(definitionId) ||
    isVarietyDialogueTerminal(definitionId) ||
    isVarietyV2DialogueTerminal(definitionId) ||
    isVarietyV3DialogueTerminal(definitionId) ||
    isMega1DialogueTerminal(definitionId)
  );
}

export const DIALOGUE_ROOT_DEFINITION_IDS = [
  DEMO_BOSS_GREETING_DEFINITION_ID,
  ...VARIETY_DIALOGUE_ROOT_IDS,
  ...VARIETY_V2_DIALOGUE_ROOT_IDS,
  ...VARIETY_V3_DIALOGUE_ROOT_IDS,
  ...MEGA1_DIALOGUE_ROOT_IDS,
] as const;

export function isDialogueRootDefinition(definitionId: string): boolean {
  return (DIALOGUE_ROOT_DEFINITION_IDS as readonly string[]).includes(definitionId);
}
