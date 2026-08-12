/**
 * V1-CONTENT-VARIETY-1 — multi-step dialogues (runtime slice, not content pack).
 */

import { DEMO_BOSS_DIALOGUE_TERMINAL_OPTION } from './boss-dialogue-constants.js';

export const DEMO_LANDLORD_GREETING_DEFINITION_ID = 'DEMO_LANDLORD_GREETING';
export const DEMO_LANDLORD_S2A = 'DEMO_LANDLORD_S2A';
export const DEMO_LANDLORD_S2B = 'DEMO_LANDLORD_S2B';
export const DEMO_LANDLORD_S2C = 'DEMO_LANDLORD_S2C';
export const DEMO_LANDLORD_S3_MERGE = 'DEMO_LANDLORD_S3_MERGE';
export const DEMO_LANDLORD_END_POSITIVE = 'DEMO_LANDLORD_END_POSITIVE';
export const DEMO_LANDLORD_END_NEUTRAL = 'DEMO_LANDLORD_END_NEUTRAL';
export const DEMO_LANDLORD_END_NEGATIVE = 'DEMO_LANDLORD_END_NEGATIVE';

export const DEMO_FRIEND_DEBT_GREETING_DEFINITION_ID = 'DEMO_FRIEND_DEBT_GREETING';
export const DEMO_FRIEND_DEBT_S2A = 'DEMO_FRIEND_DEBT_S2A';
export const DEMO_FRIEND_DEBT_S2B = 'DEMO_FRIEND_DEBT_S2B';
export const DEMO_FRIEND_DEBT_END_LEND = 'DEMO_FRIEND_DEBT_END_LEND';
export const DEMO_FRIEND_DEBT_END_PARTIAL = 'DEMO_FRIEND_DEBT_END_PARTIAL';
export const DEMO_FRIEND_DEBT_END_POSITIVE = 'DEMO_FRIEND_DEBT_END_POSITIVE';
export const DEMO_FRIEND_DEBT_END_NEUTRAL = 'DEMO_FRIEND_DEBT_END_NEUTRAL';
export const DEMO_FRIEND_DEBT_END_NEGATIVE = 'DEMO_FRIEND_DEBT_END_NEGATIVE';

export const VARIETY_DIALOGUE_TERMINAL_IDS = [
  DEMO_LANDLORD_END_POSITIVE,
  DEMO_LANDLORD_END_NEUTRAL,
  DEMO_LANDLORD_END_NEGATIVE,
  DEMO_FRIEND_DEBT_END_LEND,
  DEMO_FRIEND_DEBT_END_PARTIAL,
  DEMO_FRIEND_DEBT_END_POSITIVE,
  DEMO_FRIEND_DEBT_END_NEUTRAL,
  DEMO_FRIEND_DEBT_END_NEGATIVE,
] as const;

export const VARIETY_DIALOGUE_STEP_IDS = [
  DEMO_LANDLORD_GREETING_DEFINITION_ID,
  DEMO_LANDLORD_S2A,
  DEMO_LANDLORD_S2B,
  DEMO_LANDLORD_S2C,
  DEMO_LANDLORD_S3_MERGE,
  DEMO_FRIEND_DEBT_GREETING_DEFINITION_ID,
  DEMO_FRIEND_DEBT_S2A,
  DEMO_FRIEND_DEBT_S2B,
] as const;

export const VARIETY_DIALOGUE_ROOT_IDS = [
  DEMO_LANDLORD_GREETING_DEFINITION_ID,
  DEMO_FRIEND_DEBT_GREETING_DEFINITION_ID,
] as const;

export const DEMO_FRIEND_LEND_FULL_CASH_DELTA_MINOR = -20n;
export const DEMO_FRIEND_LEND_PARTIAL_CASH_DELTA_MINOR = -10n;
export const DEMO_FRIEND_LEND_CASH_REASON = 'DEMO_FRIEND_LEND_CASH';
export const DEMO_FRIEND_LEND_CASH_TRANSACTION_TYPE = 'loan';
export const DEMO_FRIEND_LEND_CASH_TRANSACTION_CLASS = 'money_transfer';

const LANDLORD_TRANSITIONS: Record<string, Record<string, string>> = {
  [DEMO_LANDLORD_GREETING_DEFINITION_ID]: {
    explain_error: DEMO_LANDLORD_S2A,
    accept_responsibility: DEMO_LANDLORD_S2B,
    blame_building: DEMO_LANDLORD_S2C,
    refuse_discuss: DEMO_LANDLORD_END_NEGATIVE,
  },
  [DEMO_LANDLORD_S2A]: {
    show_receipts: DEMO_LANDLORD_S3_MERGE,
    no_documents: DEMO_LANDLORD_END_NEUTRAL,
    get_angry: DEMO_LANDLORD_END_NEGATIVE,
  },
  [DEMO_LANDLORD_S2B]: {
    offer_payment_plan: DEMO_LANDLORD_END_POSITIVE,
    ask_time: DEMO_LANDLORD_S3_MERGE,
    deny: DEMO_LANDLORD_END_NEGATIVE,
  },
  [DEMO_LANDLORD_S2C]: {
    insist: DEMO_LANDLORD_END_NEGATIVE,
    back_down: DEMO_LANDLORD_S3_MERGE,
    propose_inspection: DEMO_LANDLORD_END_NEUTRAL,
  },
  [DEMO_LANDLORD_S3_MERGE]: {
    agree_terms: DEMO_LANDLORD_END_POSITIVE,
    partial_accept: DEMO_LANDLORD_END_NEUTRAL,
    walk_away: DEMO_LANDLORD_END_NEGATIVE,
  },
};

const FRIEND_DEBT_TRANSITIONS: Record<string, Record<string, string>> = {
  [DEMO_FRIEND_DEBT_GREETING_DEFINITION_ID]: {
    listen: DEMO_FRIEND_DEBT_S2A,
    hurry: DEMO_FRIEND_DEBT_END_NEUTRAL,
    suspicious: DEMO_FRIEND_DEBT_S2B,
    refuse_immediately: DEMO_FRIEND_DEBT_END_NEGATIVE,
  },
  [DEMO_FRIEND_DEBT_S2A]: {
    lend_full: DEMO_FRIEND_DEBT_END_LEND,
    lend_partial: DEMO_FRIEND_DEBT_END_PARTIAL,
    refuse_gently: DEMO_FRIEND_DEBT_END_NEUTRAL,
    refuse_firm: DEMO_FRIEND_DEBT_END_NEGATIVE,
  },
  [DEMO_FRIEND_DEBT_S2B]: {
    reconsider: DEMO_FRIEND_DEBT_S2A,
    offer_help_instead: DEMO_FRIEND_DEBT_END_POSITIVE,
    walk_away: DEMO_FRIEND_DEBT_END_NEUTRAL,
  },
};

export const VARIETY_DIALOGUE_TRANSITIONS: Record<string, Record<string, string>> = {
  ...LANDLORD_TRANSITIONS,
  ...FRIEND_DEBT_TRANSITIONS,
};

export const VARIETY_DIALOGUE_NODES: Record<
  string,
  {
    title: string;
    description: string;
    options: ReadonlyArray<{ optionId: string; label: string }>;
  }
> = {
  [DEMO_LANDLORD_GREETING_DEFINITION_ID]: {
    title: 'Il padrone di casa',
    description: 'La bolletta di questo mese è più alta del solito. Come la spieghi?',
    options: [
      { optionId: 'explain_error', label: 'Spieghi che potrebbe esserci un errore di lettura.' },
      { optionId: 'accept_responsibility', label: 'Riconosci che forse hai consumato di più.' },
      { optionId: 'blame_building', label: 'Dici che è colpa dell\'impianto del palazzo.' },
      { optionId: 'refuse_discuss', label: 'Rifiuti di discuterne adesso.' },
    ],
  },
  [DEMO_LANDLORD_S2A]: {
    title: 'Il padrone di casa',
    description: 'Capisco. Hai qualcosa che lo dimostri?',
    options: [
      { optionId: 'show_receipts', label: 'Mostri le letture precedenti.' },
      { optionId: 'no_documents', label: 'Ammetti di non avere documenti.' },
      { optionId: 'get_angry', label: 'Alzi la voce.' },
    ],
  },
  [DEMO_LANDLORD_S2B]: {
    title: 'Il padrone di casa',
    description: 'Bene. Cosa intendi fare?',
    options: [
      { optionId: 'offer_payment_plan', label: 'Proponi di pagare a rate.' },
      { optionId: 'ask_time', label: 'Chiedi tempo per verificare.' },
      { optionId: 'deny', label: 'Dici che non pagherai.' },
    ],
  },
  [DEMO_LANDLORD_S2C]: {
    title: 'Il padrone di casa',
    description: 'Non è un problema dell\'edificio, lo sappiamo entrambi.',
    options: [
      { optionId: 'insist', label: 'Insisti sulla tua versione.' },
      { optionId: 'back_down', label: 'Abbassi il tono e ne parli.' },
      { optionId: 'propose_inspection', label: 'Proponi un sopralluogo tecnico.' },
    ],
  },
  [DEMO_LANDLORD_S3_MERGE]: {
    title: 'Il padrone di casa',
    description: 'Ultima possibilità: come chiudiamo la questione?',
    options: [
      { optionId: 'agree_terms', label: 'Accetti le condizioni proposte.' },
      { optionId: 'partial_accept', label: 'Accetti solo in parte.' },
      { optionId: 'walk_away', label: 'Te ne vai senza accordo.' },
    ],
  },
  [DEMO_LANDLORD_END_POSITIVE]: {
    title: 'Il padrone di casa',
    description: 'Va bene. Spero che la prossima bolletta sia più chiara.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_LANDLORD_END_NEUTRAL]: {
    title: 'Il padrone di casa',
    description: 'Ci risentiamo. Per ora lasciamo così.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_LANDLORD_END_NEGATIVE]: {
    title: 'Il padrone di casa',
    description: 'Non mi piace il tuo atteggiamento. Ne riparleremo.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_FRIEND_DEBT_GREETING_DEFINITION_ID]: {
    title: 'Un vecchio amico',
    description: 'Ti ferma per strada. Sembra in difficoltà e vuole parlarti.',
    options: [
      { optionId: 'listen', label: 'Ti fermi ad ascoltarlo.' },
      { optionId: 'hurry', label: 'Dici che hai fretta.' },
      { optionId: 'suspicious', label: 'Ti chiedi se sia sincero.' },
      { optionId: 'refuse_immediately', label: 'Rifiuti subito di parlarne.' },
    ],
  },
  [DEMO_FRIEND_DEBT_S2A]: {
    title: 'Un vecchio amico',
    description: 'Mi servirebbero cinquanta fino a fine mese. Puoi aiutarmi?',
    options: [
      { optionId: 'lend_full', label: 'Presti tutta la somma.' },
      { optionId: 'lend_partial', label: 'Offri metà.' },
      { optionId: 'refuse_gently', label: 'Rifiuti con gentilezza.' },
      { optionId: 'refuse_firm', label: 'Rifiuti senza mezzi termini.' },
    ],
  },
  [DEMO_FRIEND_DEBT_S2B]: {
    title: 'Un vecchio amico',
    description: 'Non è il momento giusto per chiedere soldi, vero?',
    options: [
      { optionId: 'reconsider', label: 'Ripensi e gli chiedi cosa gli serve.' },
      { optionId: 'offer_help_instead', label: 'Offri aiuto senza soldi.' },
      { optionId: 'walk_away', label: 'Te ne vai.' },
    ],
  },
  [DEMO_FRIEND_DEBT_END_LEND]: {
    title: 'Un vecchio amico',
    description: 'Grazie. Non te lo dimenticherò.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_FRIEND_DEBT_END_PARTIAL]: {
    title: 'Un vecchio amico',
    description: 'Meglio di niente. Ti ringrazio comunque.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_FRIEND_DEBT_END_POSITIVE]: {
    title: 'Un vecchio amico',
    description: 'Apprezzo che ci sia ancora. Significa molto.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_FRIEND_DEBT_END_NEUTRAL]: {
    title: 'Un vecchio amico',
    description: 'Capisco. Ci sentiamo un\'altra volta.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_FRIEND_DEBT_END_NEGATIVE]: {
    title: 'Un vecchio amico',
    description: 'Ok. Non ti disturberò più.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
};

export const DEMO_LANDLORD_END_POSITIVE_MESSAGE_KEY =
  'slice.task.demo_landlord.end_positive.completed';
export const DEMO_LANDLORD_END_NEUTRAL_MESSAGE_KEY =
  'slice.task.demo_landlord.end_neutral.completed';
export const DEMO_LANDLORD_END_NEGATIVE_MESSAGE_KEY =
  'slice.task.demo_landlord.end_negative.completed';

export const DEMO_FRIEND_DEBT_END_LEND_MESSAGE_KEY =
  'slice.task.demo_friend_debt.end_lend.completed';
export const DEMO_FRIEND_DEBT_END_PARTIAL_MESSAGE_KEY =
  'slice.task.demo_friend_debt.end_partial.completed';
export const DEMO_FRIEND_DEBT_END_POSITIVE_MESSAGE_KEY =
  'slice.task.demo_friend_debt.end_positive.completed';
export const DEMO_FRIEND_DEBT_END_NEUTRAL_MESSAGE_KEY =
  'slice.task.demo_friend_debt.end_neutral.completed';
export const DEMO_FRIEND_DEBT_END_NEGATIVE_MESSAGE_KEY =
  'slice.task.demo_friend_debt.end_negative.completed';

export function getVarietyDialogueNext(definitionId: string, optionId: string): string | null {
  return VARIETY_DIALOGUE_TRANSITIONS[definitionId]?.[optionId] ?? null;
}

export function isVarietyDialogueTerminal(definitionId: string): boolean {
  return (VARIETY_DIALOGUE_TERMINAL_IDS as readonly string[]).includes(definitionId);
}

export function isVarietyDialogueStep(definitionId: string): boolean {
  return (VARIETY_DIALOGUE_STEP_IDS as readonly string[]).includes(definitionId);
}

export function isVarietyDialogueDefinition(definitionId: string): boolean {
  return isVarietyDialogueStep(definitionId) || isVarietyDialogueTerminal(definitionId);
}

/** Paths for integration tests. */
export const LANDLORD_DIALOGUE_PATH_POSITIVE = [
  'accept_responsibility',
  'offer_payment_plan',
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
] as const;

export const FRIEND_DEBT_DIALOGUE_PATH_LEND = [
  'listen',
  'lend_full',
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
] as const;

export const FRIEND_DEBT_DIALOGUE_PATH_POSITIVE = [
  'suspicious',
  'offer_help_instead',
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
] as const;
