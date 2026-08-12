import type { PersonalizationContextTag } from '../task/task-personalization-types.js';
import type { FlashOpportunityType } from '../../slice/flash-opportunities-constants.js';
import { getTaskPersonalizationMetadata } from '../task/task-personalization-metadata.js';
import { getStoryThreadConfig, getStoryThreadTemplate } from '../../slice/story-threads-constants.js';
import type {
  CombinedStoryThreadModifiers,
  StoryThreadRecord,
  StoryThreadWeightEffects,
} from './story-thread-types.js';

function mergeContextMultipliers(
  target: Partial<Record<PersonalizationContextTag, number>>,
  source?: Partial<Record<PersonalizationContextTag, number>>,
) {
  if (!source) return;
  for (const [key, value] of Object.entries(source) as Array<[PersonalizationContextTag, number]>) {
    target[key] = (target[key] ?? 1) * value;
  }
}

function mergeNumericRecord(target: Record<string, number>, source?: Record<string, number>) {
  if (!source) return;
  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] ?? 1) * value;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function combineActiveStoryThreadEffects(
  activeThreads: StoryThreadRecord[],
): CombinedStoryThreadModifiers {
  const combined: CombinedStoryThreadModifiers = {
    activeThreadIds: activeThreads.map((thread) => thread.threadId),
    taskDefinitionMultipliers: {},
    taskContextMultipliers: {},
    flashTypeMultipliers: {},
    flashTemplateMultipliers: {},
    npcTemplateMultipliers: {},
  };

  for (const thread of activeThreads) {
    const template = getStoryThreadTemplate(thread.context.threadTemplateId);
    const stageConfig = template?.stages.find((entry) => entry.stage === thread.stage);
    const effects = stageConfig?.effects;
    if (!effects) continue;

    mergeNumericRecord(combined.taskDefinitionMultipliers, effects.taskDefinitionMultipliers);
    mergeContextMultipliers(combined.taskContextMultipliers, effects.taskContextMultipliers);
    if (effects.flashTypeMultipliers) {
      for (const [key, value] of Object.entries(effects.flashTypeMultipliers) as Array<
        [FlashOpportunityType, number]
      >) {
        combined.flashTypeMultipliers[key] = (combined.flashTypeMultipliers[key] ?? 1) * value;
      }
    }
    mergeNumericRecord(combined.flashTemplateMultipliers, effects.flashTemplateMultipliers);
    mergeNumericRecord(combined.npcTemplateMultipliers, effects.npcTemplateMultipliers);
  }

  return combined;
}

export function resolveTaskStoryThreadMultiplier(
  definitionId: string,
  modifiers: CombinedStoryThreadModifiers,
): number {
  if (modifiers.activeThreadIds.length === 0) return 1;

  const config = getStoryThreadConfig();
  let multiplier = modifiers.taskDefinitionMultipliers[definitionId] ?? 1;
  const metadata = getTaskPersonalizationMetadata(definitionId);
  for (const context of metadata.contexts) {
    multiplier *= modifiers.taskContextMultipliers[context] ?? 1;
  }

  return clamp(multiplier, config.minCombinedTaskMultiplier, config.maxCombinedTaskMultiplier);
}

export function resolveFlashTemplateStoryThreadMultiplier(
  templateId: string,
  templateType: FlashOpportunityType,
  modifiers: CombinedStoryThreadModifiers,
): number {
  if (modifiers.activeThreadIds.length === 0) return 1;

  const config = getStoryThreadConfig();
  let multiplier = modifiers.flashTypeMultipliers[templateType] ?? 1;
  multiplier *= modifiers.flashTemplateMultipliers[templateId] ?? 1;

  return clamp(multiplier, config.minCombinedFlashMultiplier, config.maxCombinedFlashMultiplier);
}

export function resolveNpcStoryThreadMultiplier(
  templateId: string | undefined,
  modifiers: CombinedStoryThreadModifiers,
): number {
  if (!templateId || modifiers.activeThreadIds.length === 0) return 1;
  return modifiers.npcTemplateMultipliers[templateId] ?? 1;
}

export interface StoryThreadWeightAdjustment {
  definitionId: string;
  baseWeight: number;
  adjustedWeight: number;
  multiplier: number;
}

export function applyStoryThreadWeights(
  candidates: Array<{ definitionId: string; adjustedWeight: number }>,
  modifiers: CombinedStoryThreadModifiers,
): StoryThreadWeightAdjustment[] {
  return candidates.map((candidate) => {
    const multiplier = resolveTaskStoryThreadMultiplier(candidate.definitionId, modifiers);
    const adjustedWeight = Math.max(1, Math.round(candidate.adjustedWeight * multiplier));
    return {
      definitionId: candidate.definitionId,
      baseWeight: candidate.adjustedWeight,
      adjustedWeight,
      multiplier,
    };
  });
}

export type { StoryThreadWeightEffects };
