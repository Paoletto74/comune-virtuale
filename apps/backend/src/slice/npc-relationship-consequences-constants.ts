/**
 * NPC relationship consequences — extend here for new follow-up tasks and eligibility rules.
 */

import type { NpcCategory, NpcRelationshipQuery } from './npc-relationship-constants.js';

export type NpcConsequenceType =
  | 'opportunity'
  | 'favor'
  | 'refusal'
  | 'introduction'
  | 'warning'
  | 'social_reaction';

export interface NpcTaskConsequenceConfig {
  consequenceType: NpcConsequenceType;
  templateId: string;
  category?: NpcCategory;
  eligibilityQuery: NpcRelationshipQuery;
  /** Soft boost when the query matches. */
  matchWeightMultiplier: number;
  /** Soft penalty when the query does not match. */
  mismatchWeightMultiplier: number;
  /** When true, the task is excluded unless the query matches. */
  requireEligibility?: boolean;
  /** One-shot idempotency key stored on the relationship metadata. */
  consequenceKey: string;
}

export const DEMO_NPC_MARCO_OPPORTUNITY_DEFINITION_ID = 'DEMO_NPC_MARCO_OPPORTUNITY';
export const DEMO_NPC_GIULIA_WARNING_DEFINITION_ID = 'DEMO_NPC_GIULIA_WARNING';

export const NPC_CONSEQUENCE_TASK_DEFINITION_IDS = [
  DEMO_NPC_MARCO_OPPORTUNITY_DEFINITION_ID,
  DEMO_NPC_GIULIA_WARNING_DEFINITION_ID,
] as const;

export const NPC_TASK_CONSEQUENCES: Record<string, NpcTaskConsequenceConfig> = {
  DEMO_V2_SOCIAL_NEIGHBOR_NOISE: {
    consequenceType: 'social_reaction',
    templateId: 'neighbor_marco',
    category: 'neighbor',
    eligibilityQuery: { filter: 'known', templateId: 'neighbor_marco' },
    matchWeightMultiplier: 1.32,
    mismatchWeightMultiplier: 0.55,
    consequenceKey: 'marco_noise_return_v1',
  },
  DEMO_NPC_MARCO_OPPORTUNITY: {
    consequenceType: 'opportunity',
    templateId: 'neighbor_marco',
    category: 'neighbor',
    eligibilityQuery: { filter: 'positive', templateId: 'neighbor_marco', minLevel: 2 },
    matchWeightMultiplier: 1.42,
    mismatchWeightMultiplier: 0,
    requireEligibility: true,
    consequenceKey: 'marco_opportunity_v1',
  },
  DEMO_NPC_GIULIA_WARNING: {
    consequenceType: 'warning',
    templateId: 'acquaintance_giulia',
    category: 'acquaintance',
    eligibilityQuery: { filter: 'negative', templateId: 'acquaintance_giulia', maxLevel: -1 },
    matchWeightMultiplier: 1.38,
    mismatchWeightMultiplier: 0,
    requireEligibility: true,
    consequenceKey: 'giulia_warning_v1',
  },
  DEMO_WORK_COLLEAGUE_COVER: {
    consequenceType: 'favor',
    templateId: 'colleague_laura',
    category: 'colleague',
    eligibilityQuery: { filter: 'new', templateId: 'colleague_laura' },
    matchWeightMultiplier: 1.18,
    mismatchWeightMultiplier: 0.82,
    consequenceKey: 'laura_first_cover_v1',
  },
};

export function getNpcTaskConsequence(definitionId: string): NpcTaskConsequenceConfig | null {
  return NPC_TASK_CONSEQUENCES[definitionId] ?? null;
}

export interface NpcConsequenceTaskDef {
  definitionId: string;
  title: string;
  description: string;
  options: ReadonlyArray<{ optionId: string; label: string }>;
  messageKeys: Record<string, string>;
  effects: Record<
    string,
    { sympathy?: number; reputation?: number; cashDeltaMinor?: bigint; cashReason?: string }
  >;
}

export const NPC_CONSEQUENCE_TASKS: readonly NpcConsequenceTaskDef[] = [
  {
    definitionId: DEMO_NPC_MARCO_OPPORTUNITY_DEFINITION_ID,
    title: 'Un favore in cambio',
    description:
      'Marco ti ferma in scale. Deve assentarsi per il weekend e chiede se puoi tenere d\'occhio casa sua.',
    options: [
      { optionId: 'accept', label: 'Accetti di aiutarlo' },
      { optionId: 'decline', label: 'Rifiuti con educazione' },
    ],
    messageKeys: {
      accept: 'slice.task.npc.marco.opportunity.accept.completed',
      decline: 'slice.task.npc.marco.opportunity.decline.completed',
    },
    effects: {
      accept: { sympathy: 1, cashDeltaMinor: 12n, cashReason: 'DEMO_NPC_MARCO_OPPORTUNITY_CASH' },
      decline: {},
    },
  },
  {
    definitionId: DEMO_NPC_GIULIA_WARNING_DEFINITION_ID,
    title: 'Giulia ti riconosce',
    description:
      'Giulia ti incrocia per strada. Sembra ricordare l\'ultimo incontro, e non nel modo migliore.',
    options: [
      { optionId: 'apologize', label: 'Ti scusi per come è andata' },
      { optionId: 'ignore', label: 'Fai finta di non capire' },
      { optionId: 'walk_away', label: 'Te ne vai senza salutare' },
    ],
    messageKeys: {
      apologize: 'slice.task.npc.giulia.warning.apologize.completed',
      ignore: 'slice.task.npc.giulia.warning.ignore.completed',
      walk_away: 'slice.task.npc.giulia.warning.walk_away.completed',
    },
    effects: {
      apologize: { sympathy: 1 },
      ignore: { sympathy: -1 },
      walk_away: { sympathy: -1, reputation: -1 },
    },
  },
];
