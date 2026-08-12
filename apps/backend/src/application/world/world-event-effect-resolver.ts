import type { PersonalizationContextTag } from '../task/task-personalization-types.js';
import type { FlashOpportunityType } from '../../slice/flash-opportunities-constants.js';
import { getTaskPersonalizationMetadata } from '../task/task-personalization-metadata.js';
import { getWorldEventConfig } from '../../slice/world-events-constants.js';
import type {
  CombinedWorldEventModifiers,
  WorldEventEffects,
  WorldEventRecord,
} from './world-event-types.js';

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

export function combineActiveWorldEventEffects(
  activeEvents: WorldEventRecord[],
): CombinedWorldEventModifiers {
  const combined: CombinedWorldEventModifiers = {
    activeEventIds: activeEvents.map((event) => event.eventId),
    taskContextMultipliers: {},
    flashTypeMultipliers: {},
    flashTemplateMultipliers: {},
    npcTemplateMultipliers: {},
  };

  for (const event of activeEvents) {
    mergeContextMultipliers(combined.taskContextMultipliers, event.effects.taskContextMultipliers);
    if (event.effects.taskContextPenalties) {
      for (const [key, value] of Object.entries(event.effects.taskContextPenalties) as Array<
        [PersonalizationContextTag, number]
      >) {
        combined.taskContextMultipliers[key] = (combined.taskContextMultipliers[key] ?? 1) * value;
      }
    }
    if (event.effects.flashTypeMultipliers) {
      for (const [key, value] of Object.entries(event.effects.flashTypeMultipliers) as Array<
        [FlashOpportunityType, number]
      >) {
        combined.flashTypeMultipliers[key] = (combined.flashTypeMultipliers[key] ?? 1) * value;
      }
    }
    mergeNumericRecord(combined.flashTemplateMultipliers, event.effects.flashTemplateMultipliers);
    mergeNumericRecord(combined.npcTemplateMultipliers, event.effects.npcTemplateMultipliers);
  }

  return combined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveTaskWorldEventMultiplier(
  definitionId: string,
  modifiers: CombinedWorldEventModifiers,
): number {
  if (modifiers.activeEventIds.length === 0) return 1;

  const config = getWorldEventConfig();
  const metadata = getTaskPersonalizationMetadata(definitionId);
  let multiplier = 1;

  for (const context of metadata.contexts) {
    multiplier *= modifiers.taskContextMultipliers[context] ?? 1;
  }

  return clamp(multiplier, config.minCombinedTaskMultiplier, config.maxCombinedTaskMultiplier);
}

export function resolveFlashTemplateWorldEventMultiplier(
  templateId: string,
  templateType: FlashOpportunityType,
  modifiers: CombinedWorldEventModifiers,
): number {
  if (modifiers.activeEventIds.length === 0) return 1;

  const config = getWorldEventConfig();
  let multiplier = modifiers.flashTypeMultipliers[templateType] ?? 1;
  multiplier *= modifiers.flashTemplateMultipliers[templateId] ?? 1;

  return clamp(multiplier, config.minCombinedFlashMultiplier, config.maxCombinedFlashMultiplier);
}

export function resolveNpcWorldEventMultiplier(
  templateId: string | undefined,
  modifiers: CombinedWorldEventModifiers,
): number {
  if (!templateId || modifiers.activeEventIds.length === 0) return 1;
  return modifiers.npcTemplateMultipliers[templateId] ?? 1;
}

export interface WorldEventWeightAdjustment {
  definitionId: string;
  baseWeight: number;
  adjustedWeight: number;
  multiplier: number;
}

export function applyWorldEventWeights(
  candidates: Array<{ definitionId: string; adjustedWeight: number }>,
  modifiers: CombinedWorldEventModifiers,
): WorldEventWeightAdjustment[] {
  return candidates.map((candidate) => {
    const multiplier = resolveTaskWorldEventMultiplier(candidate.definitionId, modifiers);
    const adjustedWeight = Math.max(1, Math.round(candidate.adjustedWeight * multiplier));
    return {
      definitionId: candidate.definitionId,
      baseWeight: candidate.adjustedWeight,
      adjustedWeight,
      multiplier,
    };
  });
}

export type { WorldEventEffects };
