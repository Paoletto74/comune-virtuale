/**
 * Configurable task attribute costs, requirements and rewards.
 * Consumption is applied atomically on task completion (dialogue terminal / standard finalize).
 */
import type { PersonalValueKey } from './personal-values-constants.js';
import { normalizeAttributeMap, type AttributeCostMap } from './attribute-gameplay-constants.js';
import type { DemoCareerId } from './career-constants.js';

export interface TaskAttributeEffectSpec {
  /** Minimum values required to complete (not consumed). */
  requires?: AttributeCostMap;
  /** Values consumed on completion. */
  costs?: AttributeCostMap;
  /** Net deltas applied after costs (+/-). */
  deltas?: AttributeCostMap;
  /** Career affinity changes. */
  careerAffinity?: Partial<Record<DemoCareerId, number>>;
  /** Guaranteed global XP bonus on top of standard task XP (0 = none). */
  bonusGlobalXp?: number;
  /** Relationship metric deltas when task has NPC binding. */
  relationship?: {
    trust?: number;
    affection?: number;
    conflict?: number;
    familiarity?: number;
    unlockContact?: boolean;
  };
  /** Group relationship deltas (merged with auto membership from NPC template). */
  group?: {
    groupId: string;
    familiarity?: number;
    relationshipLevel?: number;
  };
}

type TaskEffectKey = `${string}:${string}`;

const TASK_ATTRIBUTE_EFFECTS: Partial<Record<TaskEffectKey, TaskAttributeEffectSpec>> = {
  'DEMO_ELDERLY_CROSSING:help': {
    deltas: { sympathy: 8, happiness: 3, culture: 2 },
    careerAffinity: { medicina: 2 },
    relationship: { trust: 3, affection: 2, familiarity: 4, unlockContact: true },
  },
  'DEMO_ELDERLY_CROSSING:ignore': {
    deltas: { reputation: -2, stress: 3 },
    careerAffinity: { criminalita: 1 },
    bonusGlobalXp: 10,
    relationship: { trust: -2, conflict: 2 },
  },
  'DEMO_NPC_MARCO_LEAK:help': {
    requires: { reliability: 10 },
    costs: { freeTime: 15, culture: 10 },
    deltas: { sympathy: 5, reputation: 3, happiness: 4 },
    careerAffinity: { medicina: 1, motorsport: 1 },
    relationship: { trust: 5, affection: 3, familiarity: 6, unlockContact: true },
    group: { groupId: 'group_quartiere_residenziale', familiarity: 5, relationshipLevel: 1 },
  },
  'DEMO_NPC_MARCO_LEAK:delegate': {
    costs: { reputation: 5 },
    deltas: { stress: 2, sympathy: -1 },
    bonusGlobalXp: 8,
    relationship: { trust: -1, conflict: 3 },
  },
  'DEMO_CAREER_TENTATION_MEDICINA:accept_shadow': {
    deltas: { stress: 8, luck: 5 },
    careerAffinity: { criminalita: 7, medicina: -1 },
    bonusGlobalXp: 40,
    relationship: { conflict: 4 },
  },
  'DEMO_CAREER_TENTATION_MEDICINA:decline': {
    deltas: { reputation: 4, reliability: 3 },
    careerAffinity: { medicina: 3 },
  },
  'DEMO_DIALOGUE_LUCA_V1:positive': {
    deltas: { popularity: 6, happiness: 5 },
    careerAffinity: { motorsport: 5 },
    relationship: { affection: 6, familiarity: 5, unlockContact: true },
    group: { groupId: 'group_calcetto_mercoledi', familiarity: 4, relationshipLevel: 1 },
  },
  'DEMO_DIALOGUE_LUCA_V1:ironic': {
    deltas: { popularity: 2, stress: 2 },
    careerAffinity: { motorsport: 2, criminalita: 1 },
    relationship: { affection: 2, conflict: 1 },
  },
  'DEMO_DIALOGUE_LUCA_V1:cold': {
    deltas: { reputation: -2, stress: 4 },
    bonusGlobalXp: 8,
    relationship: { affection: -4, conflict: 5 },
  },
  'ANTI_STALL_PASSEGGIATA:long_walk': {
    deltas: { happiness: 4, health: 3, sympathy: 2 },
    bonusGlobalXp: 20,
  },
  'ANTI_STALL_PASSEGGIATA:short_loop': {
    deltas: { happiness: 2, health: 1 },
    bonusGlobalXp: 12,
  },
  'ANTI_STALL_LETTURA:read_news': {
    deltas: { culture: 4, reputation: 1 },
    bonusGlobalXp: 15,
  },
  'ANTI_STALL_LETTURA:rest': {
    deltas: { happiness: 3, stress: -2 },
    bonusGlobalXp: 12,
  },
  'ANTI_STALL_CAFFE:social_coffee': {
    costs: { freeTime: 10 },
    deltas: { happiness: 4, sympathy: 3, popularity: 2 },
    bonusGlobalXp: 18,
  },
  'ANTI_STALL_CAFFE:solo_coffee': {
    costs: { freeTime: 8 },
    deltas: { happiness: 2, stress: -1 },
    bonusGlobalXp: 10,
  },
};

export function getTaskAttributeEffects(
  definitionId: string,
  optionId: string,
): TaskAttributeEffectSpec | null {
  const key = `${definitionId}:${optionId}` as TaskEffectKey;
  const spec = TASK_ATTRIBUTE_EFFECTS[key];
  if (!spec) return null;
  return {
    requires: normalizeAttributeMap(spec.requires as Record<string, number> | undefined),
    costs: normalizeAttributeMap(spec.costs as Record<string, number> | undefined),
    deltas: normalizeAttributeMap(spec.deltas as Record<string, number> | undefined),
    careerAffinity: spec.careerAffinity,
    bonusGlobalXp: spec.bonusGlobalXp,
    relationship: spec.relationship,
    group: spec.group,
  };
}

export function listTaskAttributeRequirements(definitionId: string): PersonalValueKey[] {
  const keys = new Set<PersonalValueKey>();
  for (const [compound, spec] of Object.entries(TASK_ATTRIBUTE_EFFECTS)) {
    if (!compound.startsWith(`${definitionId}:`)) continue;
    for (const key of Object.keys(spec?.requires ?? {})) {
      keys.add(key as PersonalValueKey);
    }
    for (const key of Object.keys(spec?.costs ?? {})) {
      keys.add(key as PersonalValueKey);
    }
  }
  return [...keys];
}
