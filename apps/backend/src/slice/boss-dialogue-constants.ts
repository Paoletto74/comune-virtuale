import { DEMO_BOSS_GREETING_DEFINITION_ID } from './boss-constants.js';

/** V1-DIALOGUE-1 — multi-step boss dialogue (runtime slice, not content pack). */

export const DEMO_BOSS_LATE_S2A = 'DEMO_BOSS_LATE_S2A';
export const DEMO_BOSS_LATE_S2B = 'DEMO_BOSS_LATE_S2B';
export const DEMO_BOSS_LATE_S2C = 'DEMO_BOSS_LATE_S2C';
export const DEMO_BOSS_LATE_S3_MERGE = 'DEMO_BOSS_LATE_S3_MERGE';
export const DEMO_BOSS_LATE_END_POSITIVE = 'DEMO_BOSS_LATE_END_POSITIVE';
export const DEMO_BOSS_LATE_END_NEUTRAL = 'DEMO_BOSS_LATE_END_NEUTRAL';
export const DEMO_BOSS_LATE_END_NEGATIVE = 'DEMO_BOSS_LATE_END_NEGATIVE';

export const DEMO_BOSS_DIALOGUE_TERMINAL_IDS = [
  DEMO_BOSS_LATE_END_POSITIVE,
  DEMO_BOSS_LATE_END_NEUTRAL,
  DEMO_BOSS_LATE_END_NEGATIVE,
] as const;

export const DEMO_BOSS_DIALOGUE_STEP_IDS = [
  DEMO_BOSS_GREETING_DEFINITION_ID,
  DEMO_BOSS_LATE_S2A,
  DEMO_BOSS_LATE_S2B,
  DEMO_BOSS_LATE_S2C,
  DEMO_BOSS_LATE_S3_MERGE,
] as const;

export const DEMO_BOSS_DIALOGUE_TERMINAL_OPTION = 'conclude';

export const BOSS_DIALOGUE_S1_OPTIONS = [
  'sincere_apology',
  'blame_traffic',
  'defensive',
  'provocative',
] as const;

export const BOSS_DIALOGUE_S2A_OPTIONS = [
  'offer_make_up',
  'ask_understanding',
  'stay_silent',
] as const;

export const BOSS_DIALOGUE_S2B_OPTIONS = [
  'show_evidence',
  'minimize_issue',
  'change_subject',
] as const;

export const BOSS_DIALOGUE_S2C_OPTIONS = ['double_down', 'back_down', 'apologize_now'] as const;

export const BOSS_DIALOGUE_S3_OPTIONS = [
  'commit_improvement',
  'neutral_close',
  'push_back',
] as const;

export const BOSS_DIALOGUE_TRANSITIONS: Record<string, Record<string, string>> = {
  [DEMO_BOSS_GREETING_DEFINITION_ID]: {
    sincere_apology: DEMO_BOSS_LATE_S2A,
    blame_traffic: DEMO_BOSS_LATE_S2B,
    defensive: DEMO_BOSS_LATE_S2C,
    provocative: DEMO_BOSS_LATE_END_NEGATIVE,
  },
  [DEMO_BOSS_LATE_S2A]: {
    offer_make_up: DEMO_BOSS_LATE_S3_MERGE,
    ask_understanding: DEMO_BOSS_LATE_S3_MERGE,
    stay_silent: DEMO_BOSS_LATE_S3_MERGE,
  },
  [DEMO_BOSS_LATE_S2B]: {
    show_evidence: DEMO_BOSS_LATE_S3_MERGE,
    minimize_issue: DEMO_BOSS_LATE_S3_MERGE,
    change_subject: DEMO_BOSS_LATE_END_NEUTRAL,
  },
  [DEMO_BOSS_LATE_S2C]: {
    double_down: DEMO_BOSS_LATE_END_NEGATIVE,
    back_down: DEMO_BOSS_LATE_S3_MERGE,
    apologize_now: DEMO_BOSS_LATE_END_NEUTRAL,
  },
  [DEMO_BOSS_LATE_S3_MERGE]: {
    commit_improvement: DEMO_BOSS_LATE_END_POSITIVE,
    neutral_close: DEMO_BOSS_LATE_END_NEUTRAL,
    push_back: DEMO_BOSS_LATE_END_NEGATIVE,
  },
};

export const BOSS_DIALOGUE_NODES: Record<
  string,
  {
    title: string;
    description: string;
    options: ReadonlyArray<{ optionId: string; label: string }>;
  }
> = {
  [DEMO_BOSS_GREETING_DEFINITION_ID]: {
    title: 'Il capo',
    description: 'Perché sei in ritardo?',
    options: [
      { optionId: 'sincere_apology', label: 'Chiedo scusa sinceramente e spiego cosa è successo.' },
      { optionId: 'blame_traffic', label: 'Dico che c\'era traffico imprevisto.' },
      { optionId: 'defensive', label: 'Rispondo che non è colpa mia.' },
      { optionId: 'provocative', label: 'Rispondo che non è affar suo.' },
    ],
  },
  [DEMO_BOSS_LATE_S2A]: {
    title: 'Il capo',
    description: 'Capisco. Cosa intendi fare adesso?',
    options: [
      { optionId: 'offer_make_up', label: 'Mi offro di recuperare il tempo perso.' },
      { optionId: 'ask_understanding', label: 'Chiedo se può capire la situazione.' },
      { optionId: 'stay_silent', label: 'Resto in silenzio e aspetto.' },
    ],
  },
  [DEMO_BOSS_LATE_S2B]: {
    title: 'Il capo',
    description: 'Hmm. Come giustifichi il ritardo?',
    options: [
      { optionId: 'show_evidence', label: 'Mostro un messaggio che conferma il problema.' },
      { optionId: 'minimize_issue', label: 'Minimizzo: sono arrivato solo poco dopo.' },
      { optionId: 'change_subject', label: 'Cambio discorso e passo al lavoro.' },
    ],
  },
  [DEMO_BOSS_LATE_S2C]: {
    title: 'Il capo',
    description: 'Non è una risposta che mi aspettavo.',
    options: [
      { optionId: 'double_down', label: 'Insisto che non è colpa mia.' },
      { optionId: 'back_down', label: 'Mi correggo e abbasso il tono.' },
      { optionId: 'apologize_now', label: 'Chiedo scusa adesso.' },
    ],
  },
  [DEMO_BOSS_LATE_S3_MERGE]: {
    title: 'Il capo',
    description: 'Bene. Come chiudiamo la questione?',
    options: [
      { optionId: 'commit_improvement', label: 'Prometto di migliorare e rispettare gli orari.' },
      { optionId: 'neutral_close', label: 'Accetto senza aggiungere altro.' },
      { optionId: 'push_back', label: 'Dico che la cosa non merita tutto questo.' },
    ],
  },
  [DEMO_BOSS_LATE_END_POSITIVE]: {
    title: 'Il capo',
    description: 'Va bene. Spero di non doverci tornare.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_BOSS_LATE_END_NEUTRAL]: {
    title: 'Il capo',
    description: 'Facciamo finta che non sia successo. Torna al lavoro.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_BOSS_LATE_END_NEGATIVE]: {
    title: 'Il capo',
    description: 'Non mi piace il tuo atteggiamento. Ne parleremo ancora.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
};

export const DEMO_BOSS_LATE_END_POSITIVE_MESSAGE_KEY =
  'slice.task.demo_boss.late.end_positive.completed';
export const DEMO_BOSS_LATE_END_NEUTRAL_MESSAGE_KEY =
  'slice.task.demo_boss.late.end_neutral.completed';
export const DEMO_BOSS_LATE_END_NEGATIVE_MESSAGE_KEY =
  'slice.task.demo_boss.late.end_negative.completed';

export const DEMO_BOSS_LATE_END_POSITIVE_EFFECTS = { sympathy: 1, reputation: 1 } as const;
export const DEMO_BOSS_LATE_END_NEUTRAL_EFFECTS = { sympathy: 0, reputation: 0 } as const;
export const DEMO_BOSS_LATE_END_NEGATIVE_EFFECTS = { sympathy: 0, reputation: -1 } as const;

export function getBossDialogueNext(definitionId: string, optionId: string): string | null {
  return BOSS_DIALOGUE_TRANSITIONS[definitionId]?.[optionId] ?? null;
}

export function isBossDialogueTerminal(definitionId: string): boolean {
  return (DEMO_BOSS_DIALOGUE_TERMINAL_IDS as readonly string[]).includes(definitionId);
}

export function isBossDialogueStep(definitionId: string): boolean {
  return (DEMO_BOSS_DIALOGUE_STEP_IDS as readonly string[]).includes(definitionId);
}

export function isBossDialogueDefinition(definitionId: string): boolean {
  return isBossDialogueStep(definitionId) || isBossDialogueTerminal(definitionId);
}

/** Paths for integration tests — optionIds in order from S1 through terminal conclude. */
export const BOSS_DIALOGUE_PATH_POSITIVE = [
  'sincere_apology',
  'offer_make_up',
  'commit_improvement',
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
] as const;

export const BOSS_DIALOGUE_PATH_NEUTRAL = [
  'blame_traffic',
  'change_subject',
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
] as const;

export const BOSS_DIALOGUE_PATH_NEGATIVE_SHORT = [
  'provocative',
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
] as const;

export const BOSS_DIALOGUE_PATH_NEGATIVE_LONG = [
  'defensive',
  'double_down',
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
] as const;
