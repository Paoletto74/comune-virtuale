/**
 * MEGA 1/2 demo tasks — NPC-linked, career temptation, dialogue branching.
 */
import type { NpcTaskBinding } from './npc-relationship-constants.js';

export const DEMO_NPC_MARCO_LEAK_DEFINITION_ID = 'DEMO_NPC_MARCO_LEAK';
export const DEMO_CAREER_TENTATION_MEDICINA_DEFINITION_ID = 'DEMO_CAREER_TENTATION_MEDICINA';
export const DEMO_DIALOGUE_LUCA_V1_DEFINITION_ID = 'DEMO_DIALOGUE_LUCA_V1';
export const DEMO_DIALOGUE_LUCA_V1_S2A = 'DEMO_DIALOGUE_LUCA_V1_S2A';
export const DEMO_DIALOGUE_LUCA_V1_S2B = 'DEMO_DIALOGUE_LUCA_V1_S2B';
export const DEMO_DIALOGUE_LUCA_V1_END_POSITIVE = 'DEMO_DIALOGUE_LUCA_V1_END_POSITIVE';
export const DEMO_DIALOGUE_LUCA_V1_END_IRONIC = 'DEMO_DIALOGUE_LUCA_V1_END_IRONIC';
export const DEMO_DIALOGUE_LUCA_V1_END_COLD = 'DEMO_DIALOGUE_LUCA_V1_END_COLD';

export const MEGA1_DEMO_TASK_DEFINITION_IDS = [
  DEMO_NPC_MARCO_LEAK_DEFINITION_ID,
  DEMO_CAREER_TENTATION_MEDICINA_DEFINITION_ID,
  DEMO_DIALOGUE_LUCA_V1_DEFINITION_ID,
] as const;

export const MEGA1_DIALOGUE_DEFINITION_IDS = [
  DEMO_DIALOGUE_LUCA_V1_DEFINITION_ID,
  DEMO_DIALOGUE_LUCA_V1_S2A,
  DEMO_DIALOGUE_LUCA_V1_S2B,
  DEMO_DIALOGUE_LUCA_V1_END_POSITIVE,
  DEMO_DIALOGUE_LUCA_V1_END_IRONIC,
  DEMO_DIALOGUE_LUCA_V1_END_COLD,
] as const;

export function isMega1DialogueTerminal(definitionId: string): boolean {
  return (
    definitionId === DEMO_DIALOGUE_LUCA_V1_END_POSITIVE ||
    definitionId === DEMO_DIALOGUE_LUCA_V1_END_IRONIC ||
    definitionId === DEMO_DIALOGUE_LUCA_V1_END_COLD
  );
}

export const DEMO_NPC_MARCO_LEAK_CONTENT = {
  title: 'Perdita dal lavatrice',
  description:
    'MARCO, IL TUO VICINO, HA UNA PERDITA DALLA LAVATRICE. L\'acqua sta scendendo verso il pianerottolo.',
  helpLabel: 'Aiutalo a sturare e asciugare',
  delegateLabel: 'Digli di chiamare l\'amministratore',
};

export const DEMO_CAREER_TENTATION_MEDICINA_CONTENT = {
  title: 'Offerta ombra',
  description:
    'Un contatto ti propone un lavaggio di denaro mascherato da consulenza medica. La tentazione è reale, la carriera no.',
  acceptLabel: 'Accetta l\'offerta ombra',
  declineLabel: 'Rifiuta e resta sul pezzo',
};

export const MEGA1_NPC_BINDINGS: Record<string, NpcTaskBinding> = {
  DEMO_NPC_MARCO_LEAK: {
    templateId: 'neighbor_marco',
    targetRuleRef: 'persistent_npc_neighbor_marco_leak',
    reuseKnown: true,
    selectionQuery: { filter: 'new', templateId: 'neighbor_marco' },
    optionOutcomes: {
      help: {
        outcomeKey: 'helped_leak',
        outcomeSummary: 'Hai aiutato Marco con la perdita',
        relationshipDelta: 2,
        sentiment: 'positive',
      },
      delegate: {
        outcomeKey: 'delegated_leak',
        outcomeSummary: 'Hai rimandato la responsabilità',
        relationshipDelta: -1,
        sentiment: 'negative',
      },
    },
  },
  DEMO_CAREER_TENTATION_MEDICINA: {
    templateId: 'professional_dr_neri',
    targetRuleRef: 'persistent_npc_career_temptation',
    reuseKnown: false,
    optionOutcomes: {
      accept_shadow: {
        outcomeKey: 'accepted_shadow',
        outcomeSummary: 'Hai accettato l\'offerta ombra',
        relationshipDelta: 0,
        sentiment: 'neutral',
      },
      decline: {
        outcomeKey: 'declined_shadow',
        outcomeSummary: 'Hai rifiutato l\'offerta',
        relationshipDelta: 1,
        sentiment: 'positive',
      },
    },
  },
  DEMO_DIALOGUE_LUCA_V1: {
    templateId: 'youth_luca',
    targetRuleRef: 'persistent_npc_luca_dialogue',
    reuseKnown: true,
    selectionQuery: { filter: 'known', templateId: 'youth_luca' },
    optionOutcomes: {
      enthusiastic: { outcomeKey: 'enthusiastic', outcomeSummary: 'Entusiasmo condiviso', relationshipDelta: 1, sentiment: 'positive' },
      curious: { outcomeKey: 'curious', outcomeSummary: 'Curiosità reciproca', relationshipDelta: 1, sentiment: 'positive' },
      ironic: { outcomeKey: 'ironic', outcomeSummary: 'Ironia leggera', relationshipDelta: 0, sentiment: 'neutral' },
      dismiss: { outcomeKey: 'dismiss', outcomeSummary: 'Hai tagliato corto', relationshipDelta: -1, sentiment: 'negative' },
    },
  },
};

export const MEGA1_DIALOGUE_NODES = {
  DEMO_DIALOGUE_LUCA_V1: {
    definitionId: DEMO_DIALOGUE_LUCA_V1_DEFINITION_ID,
    npcLine: 'oh senti, te lo dico chiaro… stasera al parcheggio c\'è un raduno clandestino di auto modificate. Ci vieni o fai il santarellino?',
    options: [
      { optionId: 'enthusiastic', label: 'Ci sto, raccontami tutto.', nextId: DEMO_DIALOGUE_LUCA_V1_S2A },
      { optionId: 'curious', label: 'Cos\'è esattamente?', nextId: DEMO_DIALOGUE_LUCA_V1_S2B },
      { optionId: 'ironic', label: 'Solo se non finisce in tribunale.', nextId: DEMO_DIALOGUE_LUCA_V1_S2B },
      { optionId: 'dismiss', label: 'Non fa per me.', nextId: DEMO_DIALOGUE_LUCA_V1_END_COLD },
      { optionId: 'question', label: 'Perché proprio a me lo chiedi?', nextId: DEMO_DIALOGUE_LUCA_V1_S2A },
    ],
  },
  DEMO_DIALOGUE_LUCA_V1_S2A: {
    definitionId: DEMO_DIALOGUE_LUCA_V1_S2A,
    npcLine: 'perché sei l\'unico che non fa il sermone da boomers 😂 dai, una volta sola.',
    options: [
      { optionId: 'positive', label: 'Va bene, ma niente stupidaggini.', nextId: DEMO_DIALOGUE_LUCA_V1_END_POSITIVE },
      { optionId: 'ironic', label: 'Se finisce male ti do la colpa.', nextId: DEMO_DIALOGUE_LUCA_V1_END_IRONIC },
      { optionId: 'cold', label: 'Ho cambiato idea.', nextId: DEMO_DIALOGUE_LUCA_V1_END_COLD },
    ],
  },
  DEMO_DIALOGUE_LUCA_V1_S2B: {
    definitionId: DEMO_DIALOGUE_LUCA_V1_S2B,
    npcLine: 'raduno informale, musica, motori… niente di che. O almeno così dicono.',
    options: [
      { optionId: 'positive', label: 'Sembra interessante.', nextId: DEMO_DIALOGUE_LUCA_V1_END_POSITIVE },
      { optionId: 'ironic', label: 'E i carabinieri lo sanno?', nextId: DEMO_DIALOGUE_LUCA_V1_END_IRONIC },
      { optionId: 'cold', label: 'Passo.', nextId: DEMO_DIALOGUE_LUCA_V1_END_COLD },
      { optionId: 'flirt', label: 'Vieni anche tu, o mandi solo inviti?', nextId: DEMO_DIALOGUE_LUCA_V1_END_POSITIVE },
    ],
  },
  DEMO_DIALOGUE_LUCA_V1_END_POSITIVE: {
    definitionId: DEMO_DIALOGUE_LUCA_V1_END_POSITIVE,
    npcLine: 'Grande! Non te ne pentirai. O forse sì, ma almeno avrai una storia.',
    options: [{ optionId: 'positive', label: 'Ci vediamo lì.', nextId: null }],
  },
  DEMO_DIALOGUE_LUCA_V1_END_IRONIC: {
    definitionId: DEMO_DIALOGUE_LUCA_V1_END_IRONIC,
    npcLine: 'Ah ah, sempre diffidente. Va bene, ti salvo un posto lo stesso.',
    options: [{ optionId: 'ironic', label: 'Vedremo.', nextId: null }],
  },
  DEMO_DIALOGUE_LUCA_V1_END_COLD: {
    definitionId: DEMO_DIALOGUE_LUCA_V1_END_COLD,
    npcLine: 'Ok ok, nessun problema. Non tutti hanno il coraggio di uscire dal guscio.',
    options: [{ optionId: 'cold', label: 'Arrivederci.', nextId: null }],
  },
};
