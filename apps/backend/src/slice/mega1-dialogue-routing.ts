import {
  DEMO_DIALOGUE_LUCA_V1_DEFINITION_ID,
  isMega1DialogueTerminal,
  MEGA1_DIALOGUE_NODES,
} from './mega1-demo-tasks-constants.js';

export const MEGA1_DIALOGUE_ROOT_IDS = [DEMO_DIALOGUE_LUCA_V1_DEFINITION_ID] as const;

export function isMega1DialogueDefinition(definitionId: string): boolean {
  return definitionId in MEGA1_DIALOGUE_NODES;
}

export function getMega1DialogueNext(definitionId: string, optionId: string): string | null {
  const node = MEGA1_DIALOGUE_NODES[definitionId as keyof typeof MEGA1_DIALOGUE_NODES];
  if (!node) return null;
  const option = node.options.find((entry) => entry.optionId === optionId);
  return option?.nextId ?? null;
}

export { isMega1DialogueTerminal };
