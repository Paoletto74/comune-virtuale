/**
 * Preset chat scenarios — branching conversations with 5–7 options per step.
 * No free-text chat; responses are preconfigured.
 */
import type { PersonalValueKey } from './personal-values-constants.js';
import type { DemoCareerId } from './career-constants.js';

export interface ChatOptionEffect {
  trust?: number;
  affection?: number;
  conflict?: number;
  familiarity?: number;
  personalValues?: Partial<Record<PersonalValueKey, number>>;
  careerAffinity?: Partial<Record<DemoCareerId, number>>;
}

export interface ChatOptionDefinition {
  optionId: string;
  label: string;
  nextStepId?: string;
  endConversation?: boolean;
  endReason?: string;
  effects?: ChatOptionEffect;
}

export interface ChatStepDefinition {
  stepId: string;
  npcMessage: string;
  options: ChatOptionDefinition[];
}

export interface ChatScenarioDefinition {
  scenarioId: string;
  title: string;
  npcTemplateId: string;
  actionType: 'chiacchiera' | 'spontaneous' | 'help' | 'flirt' | 'info';
  minAffection?: number;
  minFamiliarity?: number;
  minTrust?: number;
  requiresContact?: boolean;
  /** Hour range (local) when NPC is available — empty = always. */
  availableHours?: { from: number; to: number };
  initialStepId: string;
  steps: Record<string, ChatStepDefinition>;
}

export const SOCIAL_CHAT_SCENARIOS: Record<string, ChatScenarioDefinition> = {
  chat_marco_evening: {
    scenarioId: 'chat_marco_evening',
    title: 'Chiacchiera con Marco',
    npcTemplateId: 'neighbor_marco',
    actionType: 'chiacchiera',
    requiresContact: true,
    availableHours: { from: 18, to: 23 },
    initialStepId: 'start',
    steps: {
      start: {
        stepId: 'start',
        npcMessage: 'Ehi, che ci fai qui fuori? La lavatrice finalmente ha smesso di allagarmi il corridoio, grazie ancora.',
        options: [
          { optionId: 'ask_day', label: 'Com\'è andata la giornata?', nextStepId: 'day_talk' },
          { optionId: 'joke', label: 'Spero non ti serva un altro intervento d\'emergenza.', nextStepId: 'joke_reply' },
          { optionId: 'help_offer', label: 'Se serve altro, chiamami.', nextStepId: 'help_reply', effects: { trust: 2, affection: 1 } },
          { optionId: 'short', label: 'Passavo e basta.', nextStepId: 'short_reply' },
          { optionId: 'leave', label: 'Devo scappare.', endConversation: true, endReason: 'Marco annuisce e torna dentro.' },
        ],
      },
      day_talk: {
        stepId: 'day_talk',
        npcMessage: 'Lunga. Troppo lunga per uno che doveva sistemare solo un tubo. Tu come stai?',
        options: [
          { optionId: 'good', label: 'Non male, alla fine.', nextStepId: 'closing_good', effects: { familiarity: 2 } },
          { optionId: 'tired', label: 'Stanco. Il Comune non aiuta.', nextStepId: 'closing_tired', effects: { conflict: 1 } },
          { optionId: 'busy', label: 'Occupato, ma va.', endConversation: true, endReason: 'Marco sorride: «Capito. Buon proseguimento.»' },
        ],
      },
      joke_reply: {
        stepId: 'joke_reply',
        npcMessage: 'Ah ah. Molto divertente. Se succede di nuovo ti mando il conto dell\'idraulico.',
        options: [
          { optionId: 'apologize', label: 'Era solo per scherzare.', effects: { affection: 1 }, endConversation: true, endReason: 'Marco sbuffa ma non sembra davvero arrabbiato.' },
          { optionId: 'double', label: 'Magari la prossima volta chiamo qualcuno competente.', effects: { conflict: 3, affection: -1 }, endConversation: true, endReason: 'Marco ti guarda male e chiude la porta.' },
        ],
      },
      help_reply: {
        stepId: 'help_reply',
        npcMessage: 'Lo terrò a mente. Non tutti si offrono, sai?',
        options: [
          { optionId: 'nice', label: 'Figurati.', effects: { trust: 2, familiarity: 2 }, endConversation: true, endReason: 'Vi salutate con un cenno cordiale.' },
        ],
      },
      short_reply: {
        stepId: 'short_reply',
        npcMessage: 'Ok. Allora buona serata.',
        options: [
          { optionId: 'bye', label: 'A te.', endConversation: true, endReason: 'Conversazione conclusa.' },
        ],
      },
      closing_good: {
        stepId: 'closing_good',
        npcMessage: 'Bene così. A volte basta sopravvivere alla giornata.',
        options: [
          { optionId: 'agree', label: 'Concordo.', effects: { familiarity: 1, personalValues: { happiness: 2 } }, endConversation: true, endReason: 'Marco annuisce e si allontana.' },
        ],
      },
      closing_tired: {
        stepId: 'closing_tired',
        npcMessage: 'Dici sempre così? Il Comune paga lo stipendio a qualcuno, immagino.',
        options: [
          { optionId: 'shrug', label: 'Non chiedermelo.', endConversation: true, endReason: 'Marco alza le spalle e chiude la conversazione.' },
        ],
      },
    },
  },

  chat_luca_motorsport: {
    scenarioId: 'chat_luca_motorsport',
    title: 'Chiacchiera con Luca',
    npcTemplateId: 'youth_luca',
    actionType: 'chiacchiera',
    requiresContact: true,
    minAffection: 5,
    availableHours: { from: 10, to: 22 },
    initialStepId: 'start',
    steps: {
      start: {
        stepId: 'start',
        npcMessage: 'ma che ne so io 😂 però stasera ho visto un video pazzesco di drifting… tu ci capisci qualcosa?',
        options: [
          { optionId: 'enthusiast', label: 'Un po\'. Che macchina era?', nextStepId: 'car_talk', effects: { affection: 2, careerAffinity: { motorsport: 2 } } },
          { optionId: 'curious', label: 'Spiegami, sono curioso.', nextStepId: 'explain', effects: { familiarity: 2 } },
          { optionId: 'ironic', label: 'Solo se non finisce male.', nextStepId: 'ironic', effects: { conflict: 1 } },
          { optionId: 'not_interested', label: 'Non fa per me.', endConversation: true, endReason: 'Luca scrolla: «vabbè, pazienza.»' },
          { optionId: 'busy', label: 'Adesso non posso.', endConversation: true, endReason: 'Luca: «ok ok, ci sentiamo.»' },
        ],
      },
      car_talk: {
        stepId: 'car_talk',
        npcMessage: 'Una vecchia japanese modificata… se un giorno la porto al circuito ci vieni?',
        options: [
          { optionId: 'yes', label: 'Ci sto.', effects: { affection: 4, familiarity: 3, careerAffinity: { motorsport: 3 } }, endConversation: true, endReason: 'Luca sembra entusiasta. Promessa fatta.' },
          { optionId: 'maybe', label: 'Vediamo.', effects: { familiarity: 1 }, endConversation: true, endReason: 'Luca accetta il dubbio con filosofia.' },
          { optionId: 'no', label: 'Preferisco restare fuori dai guai.', effects: { conflict: 1 }, endConversation: true, endReason: 'Luca fa spallucce: «capita.»' },
        ],
      },
      explain: {
        stepId: 'explain',
        npcMessage: 'Drifting = controllare la derapata. Sembra facile, poi provi e capisci che non lo è.',
        options: [
          { optionId: 'learn', label: 'Interessante.', effects: { familiarity: 2, careerAffinity: { motorsport: 1 } }, endConversation: true, endReason: 'Luca sembra contento di aver spiegato.' },
        ],
      },
      ironic: {
        stepId: 'ironic',
        npcMessage: 'eh sì, finisce sempre male se non sai quello che fai 😅',
        options: [
          { optionId: 'fair', label: 'Hai ragione.', endConversation: true, endReason: 'Conversazione conclusa.' },
        ],
      },
    },
  },

  chat_dr_neri_advice: {
    scenarioId: 'chat_dr_neri_advice',
    title: 'Consiglio dal dottore',
    npcTemplateId: 'professional_dr_neri',
    actionType: 'help',
    requiresContact: true,
    minTrust: 40,
    initialStepId: 'start',
    steps: {
      start: {
        stepId: 'start',
        npcMessage: 'Mi permetto di dissentire dalla diagnosi che ti sei fatto da solo. Cosa ti preoccupa?',
        options: [
          { optionId: 'stress', label: 'Sono sotto stress.', nextStepId: 'stress_reply', effects: { familiarity: 1 } },
          { optionId: 'sleep', label: 'Non dormo bene.', nextStepId: 'sleep_reply' },
          { optionId: 'nothing', label: 'Niente di grave.', endConversation: true, endReason: 'Il dottore Neri annuisce: «Meglio prevenire.»' },
          { optionId: 'leave', label: 'Scusi, devo andare.', endConversation: true, endReason: '«Arrivederci. Non rimandi troppo.»' },
        ],
      },
      stress_reply: {
        stepId: 'stress_reply',
        npcMessage: 'Lo stress non è un badge d\'onore. Riposo, routine, meno eroismo improvvisato.',
        options: [
          { optionId: 'thanks', label: 'Ha ragione, grazie.', effects: { trust: 3, personalValues: { happiness: 3, stress: -4 } }, endConversation: true, endReason: 'Consiglio ricevuto.' },
          { optionId: 'deny', label: 'Ce la faccio lo stesso.', effects: { conflict: 2, personalValues: { stress: 2 } }, endConversation: true, endReason: 'Il dottore sospira ma non insiste.' },
        ],
      },
      sleep_reply: {
        stepId: 'sleep_reply',
        npcMessage: 'Orari regolari. Niente schermi a tarda notte. Sembra banale perché lo è.',
        options: [
          { optionId: 'ok', label: 'Proverò.', effects: { trust: 2, personalValues: { happiness: 2 } }, endConversation: true, endReason: 'Conversazione conclusa.' },
        ],
      },
    },
  },

  spontaneous_lucia_park: {
    scenarioId: 'spontaneous_lucia_park',
    title: 'Messaggio da Lucia',
    npcTemplateId: 'family_neighbor_paola',
    actionType: 'spontaneous',
    requiresContact: true,
    minAffection: 15,
    initialStepId: 'start',
    steps: {
      start: {
        stepId: 'start',
        npcMessage: 'Ciao! Oggi al parco c\'era un\'atmosfera strana… ti va di fare due chiacchiere?',
        options: [
          { optionId: 'yes', label: 'Certo, dimmi.', nextStepId: 'story', effects: { affection: 2 } },
          { optionId: 'later', label: 'Più tardi, ok?', endConversation: true, endReason: 'Lucia: «Va bene, ci sentiamo.»' },
          { optionId: 'busy', label: 'Ora non posso.', endConversation: true, endReason: 'Lucia capisce e chiude il messaggio.' },
        ],
      },
      story: {
        stepId: 'story',
        npcMessage: 'Ho visto Marco litigare al telefono. Non volevo ficcanasare, ma mi ha messo ansia.',
        options: [
          { optionId: 'empathy', label: 'Capisco, non è facile.', effects: { trust: 2, affection: 3, personalValues: { sympathy: 2 } }, endConversation: true, endReason: 'Lucia ringrazia per l\'ascolto.' },
          { optionId: 'gossip', label: 'Sai con chi parlava?', effects: { conflict: 2, familiarity: 1 }, endConversation: true, endReason: 'Lucia non sembra entusiasta del gossip.' },
          { optionId: 'ignore', label: 'Non è affar nostro.', effects: { affection: -2 }, endConversation: true, endReason: 'Lucia si chiude un po\'.' },
        ],
      },
    },
  },
};

export function getChatScenario(scenarioId: string): ChatScenarioDefinition | null {
  return SOCIAL_CHAT_SCENARIOS[scenarioId] ?? null;
}

export function listChatScenariosForNpc(npcTemplateId: string): ChatScenarioDefinition[] {
  return Object.values(SOCIAL_CHAT_SCENARIOS).filter((s) => s.npcTemplateId === npcTemplateId);
}

export function isNpcAvailableNow(scenario: ChatScenarioDefinition, localHour: number): boolean {
  if (!scenario.availableHours) return true;
  const { from, to } = scenario.availableHours;
  if (from <= to) return localHour >= from && localHour <= to;
  return localHour >= from || localHour <= to;
}

export function listSpontaneousScenarios(): ChatScenarioDefinition[] {
  return Object.values(SOCIAL_CHAT_SCENARIOS).filter((s) => s.actionType === 'spontaneous');
}
