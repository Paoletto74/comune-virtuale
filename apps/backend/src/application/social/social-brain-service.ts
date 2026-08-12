import { createHash } from 'node:crypto';
import { classifyIntent } from './social-brain-intent-classifier.js';
import { resolveCharacterTraits } from './social-brain-personality.js';
import type {
  CharacterTraits,
  SocialBrainEvaluation,
  SocialBrainInput,
  SocialBrainMemory,
  SocialBrainOutput,
  SocialIntent,
  SocialTone,
} from './social-brain-types.js';
import type { ChatOptionEffect } from '../../slice/social-chat-scenarios.js';

const FALLBACK_RESPONSES = ['Capito.', 'Ok.', 'Ah.', 'Dimmi.', 'Non so.'] as const;

function clampEffect(value: number | undefined, max: number): number | undefined {
  if (value == null || value === 0) return undefined;
  return Math.max(-max, Math.min(max, value));
}

function sanitizeEffects(raw: ChatOptionEffect): ChatOptionEffect {
  const out: ChatOptionEffect = {};
  const t = clampEffect(raw.trust, 8);
  const a = clampEffect(raw.affection, 8);
  const c = clampEffect(raw.conflict, 10);
  const f = clampEffect(raw.familiarity, 8);
  if (t) out.trust = t;
  if (a) out.affection = a;
  if (c) out.conflict = c;
  if (f) out.familiarity = f;
  if (raw.personalValues) out.personalValues = raw.personalValues;
  if (raw.careerAffinity) out.careerAffinity = raw.careerAffinity;
  return out;
}

export class SocialBrainService {
  classifyIntent(message: string): { intent: SocialIntent; confidence: number } {
    return classifyIntent(message);
  }

  selectTone(input: {
    intent: SocialIntent;
    traits: CharacterTraits;
    relationship: SocialBrainInput['relationship'];
  }): SocialTone {
    const { intent, traits, relationship } = input;

    if (relationship.conflict >= 55 || intent === 'INSULT' || intent === 'EXPRESS_ANGER') {
      return traits.irritability >= 60 ? 'angry' : 'cold';
    }
    if (relationship.affection >= 60 && (intent === 'EXPRESS_AFFECTION' || intent === 'COMPLIMENT')) {
      return 'affectionate';
    }
    if (traits.humor >= 65 && (intent === 'TEASE' || intent === 'GREETING')) {
      return 'playful';
    }
    if (traits.humor >= 55) return 'ironic';
    if (traits.confidence < 35) return 'shy';
    if (traits.pride >= 70) return 'formal';
    if (traits.kindness >= 65 && relationship.trust >= 45) return 'friendly';
    if (traits.kindness < 35) return 'cold';
    if (traits.irritability >= 70) return 'rude';
    if (traits.sociability >= 60) return 'friendly';
    return 'neutral';
  }

  suggestSocialEffects(input: {
    intent: SocialIntent;
    tone: SocialTone;
    traits: CharacterTraits;
    relationship: SocialBrainInput['relationship'];
  }): ChatOptionEffect {
    const { intent, tone, traits, relationship } = input;
    const raw: ChatOptionEffect = {};

    switch (intent) {
      case 'GREETING':
        raw.familiarity = 1;
        if (tone === 'friendly' || tone === 'affectionate') raw.affection = 1;
        break;
      case 'FAREWELL':
        raw.familiarity = 1;
        break;
      case 'THANK':
        raw.trust = 1;
        raw.affection = 1;
        break;
      case 'APOLOGIZE':
        raw.conflict = -2;
        raw.trust = 1;
        break;
      case 'COMPLIMENT':
        raw.affection = 2;
        raw.trust = 1;
        if (traits.pride >= 60) raw.affection = 3;
        break;
      case 'EXPRESS_AFFECTION':
        raw.affection = 3;
        raw.trust = 1;
        break;
      case 'TEASE':
        raw.familiarity = 1;
        if (traits.humor >= 50) raw.affection = 1;
        else raw.conflict = 1;
        break;
      case 'INSULT':
        raw.conflict = traits.irritability >= 50 ? 6 : 4;
        raw.affection = -2;
        raw.trust = -2;
        break;
      case 'EXPRESS_ANGER':
        raw.conflict = 3;
        break;
      case 'AGREE':
        raw.trust = 1;
        raw.familiarity = 1;
        break;
      case 'REFUSE':
        if (relationship.trust >= 50) raw.trust = -1;
        break;
      case 'INVITATION':
        raw.familiarity = 1;
        break;
      case 'REQUEST':
        raw.familiarity = 1;
        if (relationship.trust >= 55) raw.trust = 1;
        break;
      case 'QUESTION':
        raw.familiarity = 1;
        break;
      case 'IGNORE':
      case 'UNKNOWN':
        break;
      default:
        raw.familiarity = 1;
        break;
    }

    if (tone === 'angry' || tone === 'rude') {
      raw.conflict = (raw.conflict ?? 0) + 1;
    }

    return sanitizeEffects(raw);
  }

  evaluateConversation(input: Omit<SocialBrainInput, 'isOpening'>): SocialBrainEvaluation {
    const classified = this.classifyIntent(input.citizenMessage);
    const intent = classified.confidence < 0.4 ? 'UNKNOWN' : classified.intent;
    const tone = this.selectTone({
      intent,
      traits: input.traits,
      relationship: input.relationship,
    });
    const relationshipEffects = this.suggestSocialEffects({
      intent,
      tone,
      traits: input.traits,
      relationship: input.relationship,
    });

    let possibleEvent: string | undefined;
    let possibleTaskTrigger: string | undefined;
    if (
      intent === 'REQUEST' &&
      input.citizenMessage.toLowerCase().includes('lavoro') &&
      input.relationship.trust >= 45
    ) {
      possibleTaskTrigger = 'job_lead_hint';
    }
    if (intent === 'INVITATION' && input.relationship.affection >= 40) {
      possibleEvent = 'social_outing_hint';
    }

    return {
      intent,
      tone,
      confidence: classified.confidence,
      relationshipEffects,
      moodEffect: tone,
      possibleEvent,
      possibleTaskTrigger,
    };
  }

  generateResponse(input: SocialBrainInput, evaluation: SocialBrainEvaluation): string {
    if (input.isOpening) {
      return this.openingLine(input, evaluation.tone);
    }

    if (evaluation.intent === 'UNKNOWN' || evaluation.intent === 'IGNORE') {
      return this.pickFallback(input);
    }

    const pool = this.responsePool(evaluation.intent, evaluation.tone, input);
    return this.pickDeterministic(pool, input.citizenMessage, input.npcTemplateId ?? 'npc');
  }

  processMessage(input: SocialBrainInput): SocialBrainOutput {
    const evaluation = input.isOpening
      ? {
          intent: 'GREETING' as SocialIntent,
          tone: this.selectTone({
            intent: 'GREETING',
            traits: input.traits,
            relationship: input.relationship,
          }),
          confidence: 1,
          relationshipEffects: sanitizeEffects({ familiarity: 1 }),
          moodEffect: undefined,
        }
      : this.evaluateConversation(input);

    const response = this.generateResponse(input, evaluation);
    const memoryUpdate = this.buildMemoryUpdate(input, evaluation);

    return { response, evaluation, memoryUpdate };
  }

  resolveTraitsFromProfile(profile: { character?: string | null; linguisticStyle?: string | null }): CharacterTraits {
    return resolveCharacterTraits(profile);
  }

  private buildMemoryUpdate(
    input: SocialBrainInput,
    evaluation: SocialBrainEvaluation,
  ): Partial<SocialBrainMemory> {
    const topic =
      evaluation.intent === 'QUESTION' || evaluation.intent === 'REQUEST'
        ? input.citizenMessage.slice(0, 80)
        : input.memory.lastTopic;

    const update: Partial<SocialBrainMemory> = {
      lastTopic: topic,
      lastCitizenIntent: evaluation.intent,
      lastNpcTone: evaluation.tone,
      emotionalState: evaluation.moodEffect ?? evaluation.tone,
      lastRelationSummary: summarizeEffects(evaluation.relationshipEffects),
    };

    if (evaluation.intent === 'INVITATION') {
      update.invitationPending = input.citizenMessage.slice(0, 60);
    }
    if (evaluation.intent === 'INSULT' || evaluation.intent === 'EXPRESS_ANGER') {
      update.conflictNote = input.citizenMessage.slice(0, 60);
    }
    if (evaluation.intent === 'AGREE' && input.memory.invitationPending) {
      update.lastEvent = 'invitation_accepted';
      update.invitationPending = undefined;
    }
    if (evaluation.intent === 'REFUSE' && input.memory.invitationPending) {
      update.lastEvent = 'invitation_declined';
      update.invitationPending = undefined;
    }
    if (input.citizenMessage.toLowerCase().includes('prometto')) {
      update.promise = input.citizenMessage.slice(0, 60);
    }

    return update;
  }

  private openingLine(input: SocialBrainInput, tone: SocialTone): string {
    const name = input.citizenDisplayName?.split(' ')[0];
    const named = name ? `, ${name}` : '';
    const pools: Record<SocialTone, string[]> = {
      friendly: [`Ciao${named}.`, `Ehi${named}, dimmi.`, `Hey${named}.`],
      neutral: ['Ciao.', 'Dimmi.', 'Sì?'],
      cold: ['Ciao.', 'Che c\'è?', 'Sì.'],
      angry: ['Cosa vuoi?', 'Dimmi e fallo in fretta.', 'Sì?'],
      affectionate: [`Ciao${named}.`, `Mi fa piacere sentirti${named}.`, `Ehi${named}.`],
      ironic: ['Ah, ciao.', 'Eccoti.', 'Finalmente.'],
      playful: [`Ehi${named}!`, 'Oh, ciao.', 'Eccomi.'],
      rude: ['Che vuoi?', 'Sì?', 'Parla.'],
      formal: [`Buongiorno${named}.`, 'Mi dica.', 'Salve.'],
      shy: ['Ciao…', 'Ehm, ciao.', 'Oh, ciao.'],
      sarcastic: ['Ah, ciao.', 'Che sorpresa.', 'Dimmi pure.'],
    };
    return this.pickDeterministic(pools[tone] ?? pools.neutral, 'opening', input.npcTemplateId ?? 'npc');
  }

  private responsePool(intent: SocialIntent, tone: SocialTone, input: SocialBrainInput): string[] {
    const name = input.citizenDisplayName?.split(' ')[0];

    const byIntent: Partial<Record<SocialIntent, Partial<Record<SocialTone, string[]>>>> = {
      GREETING: {
        friendly: [`Ciao${name ? ` ${name}` : ''}.`, 'Hey.', 'Ciao, come va?'],
        neutral: ['Ciao.', 'Ehi.', 'Salve.'],
        cold: ['Ciao.', 'Sì?', 'Ehi.'],
        affectionate: [`Ciao${name ? ` ${name}` : ''}.`, 'Mi fa piacere sentirti.'],
        ironic: ['Ah, ciao.', 'Eccoti di nuovo.'],
        shy: ['Ciao…', 'Oh, ehi.'],
      },
      FAREWELL: {
        friendly: ['A presto.', 'Ci sentiamo.', 'Vai pure.'],
        neutral: ['Ok.', 'A dopo.', 'Va bene.'],
        cold: ['Ok.', 'Ciao.'],
        angry: ['Finalmente.', 'Ok, ciao.'],
      },
      AGREE: {
        friendly: ['Va bene.', 'Ok.', 'Perfetto.'],
        neutral: ['Ok.', 'D\'accordo.', 'Va bene.'],
        cold: ['Ok.', 'Se lo dici tu.'],
        ironic: ['Certo, certo.', 'Come no.'],
      },
      REFUSE: {
        friendly: ['Non oggi.', 'Magari un\'altra volta.', 'Passo.'],
        neutral: ['No.', 'Non posso.', 'Lascia perdere.'],
        cold: ['No.', 'Non mi va.'],
        angry: ['No.', 'Assolutamente no.'],
      },
      THANK: {
        friendly: ['Figurati.', 'Di niente.', 'Prego.'],
        neutral: ['Prego.', 'Ok.'],
        cold: ['Ok.', 'Figurati.'],
        formal: ['Prego.', 'Non c\'è di che.'],
      },
      APOLOGIZE: {
        friendly: ['Tranquillo.', 'Ok, pace.', 'Non fa niente.'],
        neutral: ['Ok.', 'Capito.'],
        cold: ['Vedremo.', 'Ok.'],
      },
      COMPLIMENT: {
        friendly: ['Grazie.', 'Che gentile.', 'Ah, grazie.'],
        neutral: ['Grazie.', 'Ok.'],
        ironic: ['Sì, sì.', 'Grazie, credo.'],
        shy: ['Grazie…', 'Oh…'],
      },
      INVITATION: {
        friendly: ['Vieni.', 'Ti va?', 'Ok, andiamo.'],
        neutral: ['Vediamo.', 'Forse.', 'Dimmi quando.'],
        cold: ['Non so.', 'Vedremo.'],
        shy: ['Mmh… forse.', 'Ci penso.'],
      },
      REQUEST: {
        friendly: ['Vediamo cosa posso fare.', 'Dimmi.', 'Ok, provo.'],
        neutral: ['Dimmi.', 'Cosa ti serve?', 'Ok.'],
        cold: ['Dipende.', 'Perché io?'],
        angry: ['E io che c\'entro?', 'Dipende.'],
      },
      QUESTION: {
        friendly: ['Bella domanda.', 'Dipende.', 'Non saprei.'],
        neutral: ['Non lo so.', 'Difficile.', 'Mah.'],
        ironic: ['Ottima domanda.', 'Chiedi al Comune.'],
        formal: ['Mi permetta… dipende.', 'Non posso garantirle una risposta.'],
      },
      INSULT: {
        angry: ['Senti…', 'Rispetta.', 'Basta.'],
        cold: ['Ok.', 'Se lo dici tu.', 'Interessante.'],
        rude: ['Eh, bravo.', 'Vai avanti così.'],
      },
      EXPRESS_AFFECTION: {
        affectionate: ['Anche a me.', 'Che dolce.', 'Grazie.'],
        friendly: ['Grazie.', 'Che carino.'],
        shy: ['Oh…', 'Grazie…'],
      },
      EXPRESS_ANGER: {
        angry: ['Calmati.', 'Ok, ho capito.', 'Respira.'],
        cold: ['Capito.', 'Ok.'],
      },
      TEASE: {
        playful: ['Ah ah.', 'Molto divertente.', 'Bravo.'],
        ironic: ['Ah sì?', 'Geniale.'],
      },
      SURPRISE: {
        friendly: ['Davvero?', 'Wow.', 'Non ci credo.'],
        neutral: ['Ah.', 'Ok.', 'Davvero?'],
      },
      ANSWER: {
        friendly: ['Capito.', 'Ok.', 'Ah, ok.'],
        neutral: ['Capito.', 'Ok.', 'Ah.'],
        cold: ['Ok.', 'Ah.'],
      },
    };

    const intentPool = byIntent[intent]?.[tone] ?? byIntent[intent]?.neutral;
    if (intentPool?.length) return intentPool;

    if (intent === 'REQUEST' && input.citizenMessage.toLowerCase().includes('lavoro')) {
      return input.relationship.trust >= 50
        ? ['Conosco qualcuno, forse.', 'Potrei sentire in giro.', 'Vediamo.']
        : ['Non so.', 'Difficile.', 'Chiedi in giro.'];
    }

    return [...FALLBACK_RESPONSES];
  }

  private pickFallback(input: SocialBrainInput): string {
    return this.pickDeterministic([...FALLBACK_RESPONSES], input.citizenMessage, input.npcTemplateId ?? 'npc');
  }

  private pickDeterministic(options: readonly string[], seed: string, npcId: string): string {
    if (options.length === 0) return FALLBACK_RESPONSES[0]!;
    const hash = createHash('sha256').update(`${npcId}:${seed}`).digest();
    const idx = hash[0]! % options.length;
    return options[idx]!;
  }
}

function summarizeEffects(effects: ChatOptionEffect): string {
  const parts: string[] = [];
  if (effects.trust) parts.push(`trust${effects.trust > 0 ? '+' : ''}${effects.trust}`);
  if (effects.affection) parts.push(`aff${effects.affection > 0 ? '+' : ''}${effects.affection}`);
  if (effects.conflict) parts.push(`conf${effects.conflict > 0 ? '+' : ''}${effects.conflict}`);
  if (effects.familiarity) parts.push(`fam${effects.familiarity > 0 ? '+' : ''}${effects.familiarity}`);
  return parts.join(' ') || 'neutral';
}

export const defaultSocialBrainService = new SocialBrainService();
