/**
 * Runtime NPC templates and task bindings — extend here for new persistent characters.
 */

import { buildInitialNpcTemplates } from './initial-npc-roster.js';
import { MEGA1_NPC_BINDINGS } from './mega1-demo-tasks-constants.js';

export type NpcCategory = 'neighbor' | 'colleague' | 'acquaintance' | 'family' | 'supplier' | 'stranger';

export interface NpcTemplateDefinition {
  templateId: string;
  displayName: string;
  ageCategory: string;
  category: NpcCategory;
  narrativeRole: string;
  occupation?: string;
  zoneId?: string;
  introductionLine: string;
}

export interface NpcInteractionOutcomeDefinition {
  outcomeKey: string;
  outcomeSummary: string;
  relationshipDelta: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface NpcTaskBinding {
  templateId: string;
  targetRuleRef: string;
  reuseKnown: boolean;
  optionOutcomes: Record<string, NpcInteractionOutcomeDefinition>;
  defaultOutcome?: NpcInteractionOutcomeDefinition;
  /** Soft selection query for first meetings / return visits. */
  selectionQuery?: NpcRelationshipQuery;
  matchWeightMultiplier?: number;
  mismatchWeightMultiplier?: number;
  /** Seed NPC wallet + steal effect for demo elderly crossing. */
  seedStealWallet?: boolean;
}

/** 30 NPC iniziali — popolazione controllata, nessuna generazione massiva. */
export const NPC_TEMPLATES: Record<string, NpcTemplateDefinition> = buildInitialNpcTemplates();

const NEIGHBOR_FAVOR_OUTCOMES: Record<string, NpcInteractionOutcomeDefinition> = {
  help: {
    outcomeKey: 'helped',
    outcomeSummary: 'Lo hai aiutato',
    relationshipDelta: 2,
    sentiment: 'positive',
  },
  ignore: {
    outcomeKey: 'ignored',
    outcomeSummary: 'Hai ignorato la richiesta',
    relationshipDelta: -2,
    sentiment: 'negative',
  },
};

const NEIGHBOR_NOISE_OUTCOMES: Record<string, NpcInteractionOutcomeDefinition> = {
  knock: {
    outcomeKey: 'talked',
    outcomeSummary: 'Sei salito a parlare con lui',
    relationshipDelta: 1,
    sentiment: 'positive',
  },
  tolerate: {
    outcomeKey: 'tolerated',
    outcomeSummary: 'Hai aspettato che finisse',
    relationshipDelta: 0,
    sentiment: 'neutral',
  },
  complain: {
    outcomeKey: 'complained',
    outcomeSummary: 'Hai lasciato un biglietto aggressivo',
    relationshipDelta: -1,
    sentiment: 'negative',
  },
};

const COLLEAGUE_COVER_OUTCOMES: Record<string, NpcInteractionOutcomeDefinition> = {
  cover: {
    outcomeKey: 'covered',
    outcomeSummary: 'Hai coperto il collega',
    relationshipDelta: 2,
    sentiment: 'positive',
  },
  decline: {
    outcomeKey: 'declined_cover',
    outcomeSummary: 'Hai rifiutato di coprire il collega',
    relationshipDelta: -1,
    sentiment: 'negative',
  },
  report: {
    outcomeKey: 'reported',
    outcomeSummary: 'Hai segnalato la situazione',
    relationshipDelta: 0,
    sentiment: 'neutral',
  },
};

const ACQUAINTANCE_FAVOR_OUTCOMES: Record<string, NpcInteractionOutcomeDefinition> = {
  help: {
    outcomeKey: 'helped',
    outcomeSummary: 'Hai aiutato il conoscente',
    relationshipDelta: 2,
    sentiment: 'positive',
  },
  polite_no: {
    outcomeKey: 'polite_refusal',
    outcomeSummary: 'Hai rifiutato con gentilezza',
    relationshipDelta: 0,
    sentiment: 'neutral',
  },
  rude_no: {
    outcomeKey: 'rude_refusal',
    outcomeSummary: 'Hai mandato via il conoscente bruscamente',
    relationshipDelta: -2,
    sentiment: 'negative',
  },
};

const ELDERLY_CROSSING_OUTCOMES: Record<string, NpcInteractionOutcomeDefinition> = {
  help: {
    outcomeKey: 'helped_elderly',
    outcomeSummary: 'Hai aiutato l\'anziana ad attraversare',
    relationshipDelta: 2,
    sentiment: 'positive',
  },
  ignore: {
    outcomeKey: 'ignored_elderly',
    outcomeSummary: 'Hai ignorato l\'anziana',
    relationshipDelta: -1,
    sentiment: 'negative',
  },
  steal_wallet: {
    outcomeKey: 'stole_wallet',
    outcomeSummary: 'Hai rubato il portafoglio',
    relationshipDelta: -3,
    sentiment: 'negative',
  },
};

export const NPC_TASK_BINDINGS: Record<string, NpcTaskBinding> = {
  DEMO_ELDERLY_CROSSING: {
    templateId: 'elderly_signora_rossi',
    targetRuleRef: 'persistent_npc_elderly_signora_rossi',
    reuseKnown: true,
    seedStealWallet: true,
    optionOutcomes: ELDERLY_CROSSING_OUTCOMES,
  },
  DEMO_NEIGHBOR_FAVOR: {
    templateId: 'neighbor_marco',
    targetRuleRef: 'persistent_npc_neighbor_marco',
    reuseKnown: true,
    optionOutcomes: NEIGHBOR_FAVOR_OUTCOMES,
    selectionQuery: { filter: 'new', templateId: 'neighbor_marco' },
    matchWeightMultiplier: 1.12,
    mismatchWeightMultiplier: 0.86,
  },
  DEMO_V2_SOCIAL_NEIGHBOR_NOISE: {
    templateId: 'neighbor_marco',
    targetRuleRef: 'persistent_npc_neighbor_marco_return',
    reuseKnown: true,
    optionOutcomes: NEIGHBOR_NOISE_OUTCOMES,
  },
  DEMO_WORK_COLLEAGUE_COVER: {
    templateId: 'colleague_laura',
    targetRuleRef: 'persistent_npc_colleague_laura',
    reuseKnown: true,
    optionOutcomes: COLLEAGUE_COVER_OUTCOMES,
  },
  DEMO_ACQUAINTANCE_FAVOR: {
    templateId: 'acquaintance_giulia',
    targetRuleRef: 'persistent_npc_acquaintance_giulia',
    reuseKnown: true,
    optionOutcomes: ACQUAINTANCE_FAVOR_OUTCOMES,
    selectionQuery: { filter: 'new', templateId: 'acquaintance_giulia' },
    matchWeightMultiplier: 1.1,
    mismatchWeightMultiplier: 0.88,
  },
  DEMO_NPC_MARCO_OPPORTUNITY: {
    templateId: 'neighbor_marco',
    targetRuleRef: 'persistent_npc_neighbor_marco_opportunity',
    reuseKnown: true,
    optionOutcomes: {
      accept: {
        outcomeKey: 'accepted_opportunity',
        outcomeSummary: 'Hai accettato di aiutarlo',
        relationshipDelta: 1,
        sentiment: 'positive',
      },
      decline: {
        outcomeKey: 'declined_opportunity',
        outcomeSummary: 'Hai rifiutato il favore',
        relationshipDelta: 0,
        sentiment: 'neutral',
      },
    },
  },
  DEMO_NPC_GIULIA_WARNING: {
    templateId: 'acquaintance_giulia',
    targetRuleRef: 'persistent_npc_acquaintance_giulia_warning',
    reuseKnown: true,
    optionOutcomes: {
      apologize: {
        outcomeKey: 'apologized',
        outcomeSummary: 'Ti sei scusato con Giulia',
        relationshipDelta: 1,
        sentiment: 'neutral',
      },
      ignore: {
        outcomeKey: 'ignored_warning',
        outcomeSummary: 'Hai ignorato il richiamo',
        relationshipDelta: -1,
        sentiment: 'negative',
      },
      walk_away: {
        outcomeKey: 'walked_away',
        outcomeSummary: 'Te ne sei andato senza salutare',
        relationshipDelta: -1,
        sentiment: 'negative',
      },
    },
  },
  ...MEGA1_NPC_BINDINGS,
};

export function getNpcTaskBinding(definitionId: string): NpcTaskBinding | null {
  return NPC_TASK_BINDINGS[definitionId] ?? null;
}

export function getNpcTemplate(templateId: string): NpcTemplateDefinition | null {
  return NPC_TEMPLATES[templateId] ?? null;
}

export function resolveNpcInteractionOutcome(
  binding: NpcTaskBinding,
  optionId: string,
): NpcInteractionOutcomeDefinition {
  return (
    binding.optionOutcomes[optionId] ??
    binding.defaultOutcome ?? {
      outcomeKey: 'interacted',
      outcomeSummary: 'Avete interagito',
      relationshipDelta: 0,
      sentiment: 'neutral',
    }
  );
}

/** Future task selection filters — wired via npc-relationship-scorer. */
export type NpcRelationshipFilter = 'known' | 'positive' | 'negative' | 'neutral' | 'new';

export interface NpcRelationshipQuery {
  filter: NpcRelationshipFilter;
  templateId?: string;
  category?: NpcCategory;
  minLevel?: number;
  maxLevel?: number;
}
