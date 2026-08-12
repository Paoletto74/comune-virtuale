/**
 * V1-CONTENT-VARIETY-2 — multi-step dialogues (runtime slice, not content pack).
 */

import { DEMO_BOSS_DIALOGUE_TERMINAL_OPTION } from './boss-dialogue-constants.js';

export const DEMO_V2_DIALOGUE_SUPERVISOR_GREETING = 'DEMO_V2_DIALOGUE_SUPERVISOR_GREETING';
export const DEMO_V2_DIALOGUE_SUPERVISOR_S2A = 'DEMO_V2_DIALOGUE_SUPERVISOR_S2A';
export const DEMO_V2_DIALOGUE_SUPERVISOR_S2B = 'DEMO_V2_DIALOGUE_SUPERVISOR_S2B';
export const DEMO_V2_DIALOGUE_SUPERVISOR_S3 = 'DEMO_V2_DIALOGUE_SUPERVISOR_S3';
export const DEMO_V2_DIALOGUE_SUPERVISOR_END_POSITIVE = 'DEMO_V2_DIALOGUE_SUPERVISOR_END_POSITIVE';
export const DEMO_V2_DIALOGUE_SUPERVISOR_END_NEUTRAL = 'DEMO_V2_DIALOGUE_SUPERVISOR_END_NEUTRAL';
export const DEMO_V2_DIALOGUE_SUPERVISOR_END_NEGATIVE = 'DEMO_V2_DIALOGUE_SUPERVISOR_END_NEGATIVE';

export const DEMO_V2_DIALOGUE_FAMILY_GREETING = 'DEMO_V2_DIALOGUE_FAMILY_GREETING';
export const DEMO_V2_DIALOGUE_FAMILY_S2A = 'DEMO_V2_DIALOGUE_FAMILY_S2A';
export const DEMO_V2_DIALOGUE_FAMILY_S2B = 'DEMO_V2_DIALOGUE_FAMILY_S2B';
export const DEMO_V2_DIALOGUE_FAMILY_END_POSITIVE = 'DEMO_V2_DIALOGUE_FAMILY_END_POSITIVE';
export const DEMO_V2_DIALOGUE_FAMILY_END_NEUTRAL = 'DEMO_V2_DIALOGUE_FAMILY_END_NEUTRAL';
export const DEMO_V2_DIALOGUE_FAMILY_END_NEGATIVE = 'DEMO_V2_DIALOGUE_FAMILY_END_NEGATIVE';

export const DEMO_V2_DIALOGUE_NEIGHBOR_GREETING = 'DEMO_V2_DIALOGUE_NEIGHBOR_GREETING';
export const DEMO_V2_DIALOGUE_NEIGHBOR_S2A = 'DEMO_V2_DIALOGUE_NEIGHBOR_S2A';
export const DEMO_V2_DIALOGUE_NEIGHBOR_S2B = 'DEMO_V2_DIALOGUE_NEIGHBOR_S2B';
export const DEMO_V2_DIALOGUE_NEIGHBOR_END_POSITIVE = 'DEMO_V2_DIALOGUE_NEIGHBOR_END_POSITIVE';
export const DEMO_V2_DIALOGUE_NEIGHBOR_END_NEUTRAL = 'DEMO_V2_DIALOGUE_NEIGHBOR_END_NEUTRAL';
export const DEMO_V2_DIALOGUE_NEIGHBOR_END_NEGATIVE = 'DEMO_V2_DIALOGUE_NEIGHBOR_END_NEGATIVE';

export const DEMO_V2_DIALOGUE_SCAM_GREETING = 'DEMO_V2_DIALOGUE_SCAM_GREETING';
export const DEMO_V2_DIALOGUE_SCAM_S2A = 'DEMO_V2_DIALOGUE_SCAM_S2A';
export const DEMO_V2_DIALOGUE_SCAM_S2B = 'DEMO_V2_DIALOGUE_SCAM_S2B';
export const DEMO_V2_DIALOGUE_SCAM_END_POSITIVE = 'DEMO_V2_DIALOGUE_SCAM_END_POSITIVE';
export const DEMO_V2_DIALOGUE_SCAM_END_NEUTRAL = 'DEMO_V2_DIALOGUE_SCAM_END_NEUTRAL';
export const DEMO_V2_DIALOGUE_SCAM_END_NEGATIVE = 'DEMO_V2_DIALOGUE_SCAM_END_NEGATIVE';

export const VARIETY_V2_DIALOGUE_TERMINAL_IDS = [
  DEMO_V2_DIALOGUE_SUPERVISOR_END_POSITIVE,
  DEMO_V2_DIALOGUE_SUPERVISOR_END_NEUTRAL,
  DEMO_V2_DIALOGUE_SUPERVISOR_END_NEGATIVE,
  DEMO_V2_DIALOGUE_FAMILY_END_POSITIVE,
  DEMO_V2_DIALOGUE_FAMILY_END_NEUTRAL,
  DEMO_V2_DIALOGUE_FAMILY_END_NEGATIVE,
  DEMO_V2_DIALOGUE_NEIGHBOR_END_POSITIVE,
  DEMO_V2_DIALOGUE_NEIGHBOR_END_NEUTRAL,
  DEMO_V2_DIALOGUE_NEIGHBOR_END_NEGATIVE,
  DEMO_V2_DIALOGUE_SCAM_END_POSITIVE,
  DEMO_V2_DIALOGUE_SCAM_END_NEUTRAL,
  DEMO_V2_DIALOGUE_SCAM_END_NEGATIVE,
] as const;

export const VARIETY_V2_DIALOGUE_STEP_IDS = [
  DEMO_V2_DIALOGUE_SUPERVISOR_GREETING,
  DEMO_V2_DIALOGUE_SUPERVISOR_S2A,
  DEMO_V2_DIALOGUE_SUPERVISOR_S2B,
  DEMO_V2_DIALOGUE_SUPERVISOR_S3,
  DEMO_V2_DIALOGUE_FAMILY_GREETING,
  DEMO_V2_DIALOGUE_FAMILY_S2A,
  DEMO_V2_DIALOGUE_FAMILY_S2B,
  DEMO_V2_DIALOGUE_NEIGHBOR_GREETING,
  DEMO_V2_DIALOGUE_NEIGHBOR_S2A,
  DEMO_V2_DIALOGUE_NEIGHBOR_S2B,
  DEMO_V2_DIALOGUE_SCAM_GREETING,
  DEMO_V2_DIALOGUE_SCAM_S2A,
  DEMO_V2_DIALOGUE_SCAM_S2B,
] as const;

export const VARIETY_V2_DIALOGUE_ROOT_IDS = [
  DEMO_V2_DIALOGUE_SUPERVISOR_GREETING,
  DEMO_V2_DIALOGUE_FAMILY_GREETING,
  DEMO_V2_DIALOGUE_NEIGHBOR_GREETING,
  DEMO_V2_DIALOGUE_SCAM_GREETING,
] as const;

export const VARIETY_V2_DIALOGUE_TRANSITIONS: Record<string, Record<string, string>> = {
  [DEMO_V2_DIALOGUE_SUPERVISOR_GREETING]: {
    humble: DEMO_V2_DIALOGUE_SUPERVISOR_S2A,
    confident: DEMO_V2_DIALOGUE_SUPERVISOR_S2B,
    defensive: DEMO_V2_DIALOGUE_SUPERVISOR_END_NEGATIVE,
    ask_examples: DEMO_V2_DIALOGUE_SUPERVISOR_S3,
  },
  [DEMO_V2_DIALOGUE_SUPERVISOR_S2A]: {
    commit: DEMO_V2_DIALOGUE_SUPERVISOR_END_POSITIVE,
    vague: DEMO_V2_DIALOGUE_SUPERVISOR_END_NEUTRAL,
    push_back: DEMO_V2_DIALOGUE_SUPERVISOR_END_NEGATIVE,
  },
  [DEMO_V2_DIALOGUE_SUPERVISOR_S2B]: {
    evidence: DEMO_V2_DIALOGUE_SUPERVISOR_END_POSITIVE,
    tone_down: DEMO_V2_DIALOGUE_SUPERVISOR_END_NEUTRAL,
    boast: DEMO_V2_DIALOGUE_SUPERVISOR_END_NEGATIVE,
  },
  [DEMO_V2_DIALOGUE_SUPERVISOR_S3]: {
    plan: DEMO_V2_DIALOGUE_SUPERVISOR_END_POSITIVE,
    minimal: DEMO_V2_DIALOGUE_SUPERVISOR_END_NEUTRAL,
    refuse: DEMO_V2_DIALOGUE_SUPERVISOR_END_NEGATIVE,
  },
  [DEMO_V2_DIALOGUE_FAMILY_GREETING]: {
    listen: DEMO_V2_DIALOGUE_FAMILY_S2A,
    take_side: DEMO_V2_DIALOGUE_FAMILY_S2B,
    avoid: DEMO_V2_DIALOGUE_FAMILY_END_NEUTRAL,
    leave: DEMO_V2_DIALOGUE_FAMILY_END_NEGATIVE,
  },
  [DEMO_V2_DIALOGUE_FAMILY_S2A]: {
    propose_talk: DEMO_V2_DIALOGUE_FAMILY_END_POSITIVE,
    stay_neutral: DEMO_V2_DIALOGUE_FAMILY_END_NEUTRAL,
    escalate: DEMO_V2_DIALOGUE_FAMILY_END_NEGATIVE,
  },
  [DEMO_V2_DIALOGUE_FAMILY_S2B]: {
    reconsider: DEMO_V2_DIALOGUE_FAMILY_S2A,
    insist: DEMO_V2_DIALOGUE_FAMILY_END_NEGATIVE,
    apologize: DEMO_V2_DIALOGUE_FAMILY_END_NEUTRAL,
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_GREETING]: {
    polite: DEMO_V2_DIALOGUE_NEIGHBOR_S2A,
    firm: DEMO_V2_DIALOGUE_NEIGHBOR_S2B,
    ignore: DEMO_V2_DIALOGUE_NEIGHBOR_END_NEUTRAL,
    threaten: DEMO_V2_DIALOGUE_NEIGHBOR_END_NEGATIVE,
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_S2A]: {
    agree: DEMO_V2_DIALOGUE_NEIGHBOR_END_POSITIVE,
    compromise: DEMO_V2_DIALOGUE_NEIGHBOR_END_NEUTRAL,
    back_down: DEMO_V2_DIALOGUE_NEIGHBOR_END_NEGATIVE,
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_S2B]: {
    document: DEMO_V2_DIALOGUE_NEIGHBOR_END_POSITIVE,
    partial: DEMO_V2_DIALOGUE_NEIGHBOR_END_NEUTRAL,
    yell: DEMO_V2_DIALOGUE_NEIGHBOR_END_NEGATIVE,
  },
  [DEMO_V2_DIALOGUE_SCAM_GREETING]: {
    stay_on_line: DEMO_V2_DIALOGUE_SCAM_S2A,
    suspicious: DEMO_V2_DIALOGUE_SCAM_S2B,
    hang_up: DEMO_V2_DIALOGUE_SCAM_END_POSITIVE,
    comply: DEMO_V2_DIALOGUE_SCAM_END_NEGATIVE,
  },
  [DEMO_V2_DIALOGUE_SCAM_S2A]: {
    give_data: DEMO_V2_DIALOGUE_SCAM_END_NEGATIVE,
    stall: DEMO_V2_DIALOGUE_SCAM_S2B,
    record: DEMO_V2_DIALOGUE_SCAM_END_POSITIVE,
  },
  [DEMO_V2_DIALOGUE_SCAM_S2B]: {
    verify: DEMO_V2_DIALOGUE_SCAM_END_POSITIVE,
    block: DEMO_V2_DIALOGUE_SCAM_END_NEUTRAL,
    transfer: DEMO_V2_DIALOGUE_SCAM_END_NEGATIVE,
  },
};

export const VARIETY_V2_DIALOGUE_NODES: Record<
  string,
  {
    title: string;
    description: string;
    options: ReadonlyArray<{ optionId: string; label: string }>;
  }
> = {
  [DEMO_V2_DIALOGUE_SUPERVISOR_GREETING]: {
    title: 'Valutazione con il superiore',
    description: 'Il tuo superiore vuole fare il punto sulle ultime settimane.',
    options: [
      { optionId: 'humble', label: 'Parti dicendo che c\'è margine di miglioramento.' },
      { optionId: 'confident', label: 'Presenti i risultati ottenuti.' },
      { optionId: 'defensive', label: 'Dici che il carico di lavoro è eccessivo.' },
      { optionId: 'ask_examples', label: 'Chiedi esempi concreti.' },
    ],
  },
  [DEMO_V2_DIALOGUE_SUPERVISOR_S2A]: {
    title: 'Valutazione con il superiore',
    description: 'Bene. Cosa faresti diversamente da domani?',
    options: [
      { optionId: 'commit', label: 'Proponi un piano chiaro.' },
      { optionId: 'vague', label: 'Rispondi genericamente.' },
      { optionId: 'push_back', label: 'Dici che non serve cambiare molto.' },
    ],
  },
  [DEMO_V2_DIALOGUE_SUPERVISOR_S2B]: {
    title: 'Valutazione con il superiore',
    description: 'Interessante. Come giustifichi questi numeri?',
    options: [
      { optionId: 'evidence', label: 'Mostri dati e dettagli.' },
      { optionId: 'tone_down', label: 'Abbassi il tono e ascolti.' },
      { optionId: 'boast', label: 'Insisti che sei il migliore del team.' },
    ],
  },
  [DEMO_V2_DIALOGUE_SUPERVISOR_S3]: {
    title: 'Valutazione con il superiore',
    description: 'Capito. Come vuoi procedere?',
    options: [
      { optionId: 'plan', label: 'Accetti obiettivi misurabili.' },
      { optionId: 'minimal', label: 'Accetti il minimo indispensabile.' },
      { optionId: 'refuse', label: 'Rifiuti nuove responsabilità.' },
    ],
  },
  [DEMO_V2_DIALOGUE_SUPERVISOR_END_POSITIVE]: {
    title: 'Valutazione con il superiore',
    description: 'Bene. Mi piace questo approccio.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_V2_DIALOGUE_SUPERVISOR_END_NEUTRAL]: {
    title: 'Valutazione con il superiore',
    description: 'Ok. Ci risentiamo al prossimo round.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_V2_DIALOGUE_SUPERVISOR_END_NEGATIVE]: {
    title: 'Valutazione con il superiore',
    description: 'Non è la risposta che speravo. Ne riparleremo.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_V2_DIALOGUE_FAMILY_GREETING]: {
    title: 'Lite in famiglia',
    description: 'Due parenti litigano davanti a te per una questione di eredità minore.',
    options: [
      { optionId: 'listen', label: 'Ascolti entrambi.' },
      { optionId: 'take_side', label: 'Prendi le parti di uno.' },
      { optionId: 'avoid', label: 'Dici che non è affar tuo.' },
      { optionId: 'leave', label: 'Te ne vai.' },
    ],
  },
  [DEMO_V2_DIALOGUE_FAMILY_S2A]: {
    title: 'Lite in famiglia',
    description: 'Cosa suggerisci di fare adesso?',
    options: [
      { optionId: 'propose_talk', label: 'Proponi un incontro calmo.' },
      { optionId: 'stay_neutral', label: 'Resti neutrale.' },
      { optionId: 'escalate', label: 'Alimenti la discussione.' },
    ],
  },
  [DEMO_V2_DIALOGUE_FAMILY_S2B]: {
    title: 'Lite in famiglia',
    description: 'Quindi secondo te ha ragione lui?',
    options: [
      { optionId: 'reconsider', label: 'Ripensi e cerchi compromesso.' },
      { optionId: 'insist', label: 'Insisti sulla tua posizione.' },
      { optionId: 'apologize', label: 'Chiedi scusa per esserti intromesso.' },
    ],
  },
  [DEMO_V2_DIALOGUE_FAMILY_END_POSITIVE]: {
    title: 'Lite in famiglia',
    description: 'Forse possiamo chiudere la questione senza drammi.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_V2_DIALOGUE_FAMILY_END_NEUTRAL]: {
    title: 'Lite in famiglia',
    description: 'La tensione cala, ma niente è risolto del tutto.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_V2_DIALOGUE_FAMILY_END_NEGATIVE]: {
    title: 'Lite in famiglia',
    description: 'La situazione peggiora. Tutti se ne pentiranno.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_GREETING]: {
    title: 'Confine con il vicino',
    description: 'Il vicino sostiene che la tua siepe invade il suo giardino.',
    options: [
      { optionId: 'polite', label: 'Proponi di parlarne con calma.' },
      { optionId: 'firm', label: 'Dici che la siepe è nel tuo terreno.' },
      { optionId: 'ignore', label: 'Non rispondi adesso.' },
      { optionId: 'threaten', label: 'Minacci di chiamare le autorità.' },
    ],
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_S2A]: {
    title: 'Confine con il vicino',
    description: 'Potremmo tagliare un po\' da entrambe le parti?',
    options: [
      { optionId: 'agree', label: 'Accetti un compromesso.' },
      { optionId: 'compromise', label: 'Offri una soluzione parziale.' },
      { optionId: 'back_down', label: 'Ti rifiuti di cedere.' },
    ],
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_S2B]: {
    title: 'Confine con il vicino',
    description: 'Ho i documenti del catasto qui.',
    options: [
      { optionId: 'document', label: 'Verificate insieme.' },
      { optionId: 'partial', label: 'Accetti solo un piccolo taglio.' },
      { optionId: 'yell', label: 'Alzi la voce.' },
    ],
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_END_POSITIVE]: {
    title: 'Confine con il vicino',
    description: 'Meglio così. Ci teniamo in contatto.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_END_NEUTRAL]: {
    title: 'Confine con il vicino',
    description: 'Tregua incerta, ma nessun danno.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_END_NEGATIVE]: {
    title: 'Confine con il vicino',
    description: 'Il rapporto con il vicino è rovinato.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_V2_DIALOGUE_SCAM_GREETING]: {
    title: 'Chiamata sospetta',
    description: 'Una voce al telefono dice di essere della banca e chiede codici urgenti.',
    options: [
      { optionId: 'stay_on_line', label: 'Resti in linea ad ascoltare.' },
      { optionId: 'suspicious', label: 'Fai domande diffidenti.' },
      { optionId: 'hang_up', label: 'Riattacchi subito.' },
      { optionId: 'comply', label: 'Fornisci i dati richiesti.' },
    ],
  },
  [DEMO_V2_DIALOGUE_SCAM_S2A]: {
    title: 'Chiamata sospetta',
    description: 'Deve confermare subito, altrimenti il conto verrà bloccato.',
    options: [
      { optionId: 'give_data', label: 'Dai i codici.' },
      { optionId: 'stall', label: 'Prendi tempo.' },
      { optionId: 'record', label: 'Dici che stai registrando.' },
    ],
  },
  [DEMO_V2_DIALOGUE_SCAM_S2B]: {
    title: 'Chiamata sospetta',
    description: 'Perché non posso richiamare il numero ufficiale?',
    options: [
      { optionId: 'verify', label: 'Verifichi tramite canale ufficiale.' },
      { optionId: 'block', label: 'Blocchi il numero.' },
      { optionId: 'transfer', label: 'Segui le istruzioni.' },
    ],
  },
  [DEMO_V2_DIALOGUE_SCAM_END_POSITIVE]: {
    title: 'Chiamata sospetta',
    description: 'Eviti la truffa. Il conto è al sicuro.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_V2_DIALOGUE_SCAM_END_NEUTRAL]: {
    title: 'Chiamata sospetta',
    description: 'La chiamata finisce senza danni, ma ti lascia perplesso.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
  [DEMO_V2_DIALOGUE_SCAM_END_NEGATIVE]: {
    title: 'Chiamata sospetta',
    description: 'Hai perso denaro. La cosa ti costerà cara.',
    options: [{ optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION, label: 'Concludi la conversazione' }],
  },
};

export const VARIETY_V2_DIALOGUE_TERMINAL_EFFECTS: Record<
  string,
  {
    messageKey: string;
    sympathy?: number;
    reputation?: number;
    cashDeltaMinor?: bigint;
    cashReason?: string;
  }
> = {
  [DEMO_V2_DIALOGUE_SUPERVISOR_END_POSITIVE]: {
    messageKey: 'slice.task.v2.dialogue.supervisor.end_positive.completed',
    sympathy: 1,
    reputation: 1,
  },
  [DEMO_V2_DIALOGUE_SUPERVISOR_END_NEUTRAL]: {
    messageKey: 'slice.task.v2.dialogue.supervisor.end_neutral.completed',
  },
  [DEMO_V2_DIALOGUE_SUPERVISOR_END_NEGATIVE]: {
    messageKey: 'slice.task.v2.dialogue.supervisor.end_negative.completed',
    sympathy: -1,
    reputation: -1,
  },
  [DEMO_V2_DIALOGUE_FAMILY_END_POSITIVE]: {
    messageKey: 'slice.task.v2.dialogue.family.end_positive.completed',
    sympathy: 1,
  },
  [DEMO_V2_DIALOGUE_FAMILY_END_NEUTRAL]: {
    messageKey: 'slice.task.v2.dialogue.family.end_neutral.completed',
  },
  [DEMO_V2_DIALOGUE_FAMILY_END_NEGATIVE]: {
    messageKey: 'slice.task.v2.dialogue.family.end_negative.completed',
    sympathy: -1,
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_END_POSITIVE]: {
    messageKey: 'slice.task.v2.dialogue.neighbor.end_positive.completed',
    sympathy: 1,
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_END_NEUTRAL]: {
    messageKey: 'slice.task.v2.dialogue.neighbor.end_neutral.completed',
  },
  [DEMO_V2_DIALOGUE_NEIGHBOR_END_NEGATIVE]: {
    messageKey: 'slice.task.v2.dialogue.neighbor.end_negative.completed',
    sympathy: -1,
    reputation: -1,
  },
  [DEMO_V2_DIALOGUE_SCAM_END_POSITIVE]: {
    messageKey: 'slice.task.v2.dialogue.scam.end_positive.completed',
    reputation: 1,
  },
  [DEMO_V2_DIALOGUE_SCAM_END_NEUTRAL]: {
    messageKey: 'slice.task.v2.dialogue.scam.end_neutral.completed',
  },
  [DEMO_V2_DIALOGUE_SCAM_END_NEGATIVE]: {
    messageKey: 'slice.task.v2.dialogue.scam.end_negative.completed',
    cashDeltaMinor: -35n,
    cashReason: 'DEMO_V2_SCAM_LOSS_CASH',
    reputation: -1,
  },
};

export function getVarietyV2DialogueNext(definitionId: string, optionId: string): string | null {
  return VARIETY_V2_DIALOGUE_TRANSITIONS[definitionId]?.[optionId] ?? null;
}

export function isVarietyV2DialogueTerminal(definitionId: string): boolean {
  return (VARIETY_V2_DIALOGUE_TERMINAL_IDS as readonly string[]).includes(definitionId);
}

export function isVarietyV2DialogueStep(definitionId: string): boolean {
  return (VARIETY_V2_DIALOGUE_STEP_IDS as readonly string[]).includes(definitionId);
}

export function isVarietyV2DialogueDefinition(definitionId: string): boolean {
  return isVarietyV2DialogueStep(definitionId) || isVarietyV2DialogueTerminal(definitionId);
}

export const SUPERVISOR_DIALOGUE_PATH_POSITIVE = [
  'humble',
  'commit',
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
] as const;

export const SCAM_DIALOGUE_PATH_POSITIVE = [
  'hang_up',
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
] as const;

export const SCAM_DIALOGUE_PATH_NEGATIVE = [
  'comply',
  DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
] as const;
