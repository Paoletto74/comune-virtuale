import type { SocialIntent } from './social-brain-types.js';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s?!]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(text: string, patterns: readonly string[]): boolean {
  return patterns.some((p) => text.includes(p));
}

/** Lightweight Italian keyword intent classifier — no NLP deps. */
export function classifyIntent(message: string): { intent: SocialIntent; confidence: number } {
  const text = normalize(message);
  if (!text || text.length <= 1) {
    return { intent: 'IGNORE', confidence: 0.9 };
  }

  if (hasAny(text, ['idiota', 'stupido', 'cretino', 'vaffanculo', 'schifo', 'odio'])) {
    return { intent: 'INSULT', confidence: 0.92 };
  }
  if (hasAny(text, ['ti voglio bene', 'mi manchi', 'ti amo', 'affetto', 'caro ', 'cara '])) {
    return { intent: 'EXPRESS_AFFECTION', confidence: 0.88 };
  }
  if (hasAny(text, ['arrabbiato', 'incazzato', 'basta cosi', 'ne ho abbastanza', 'sufficiente'])) {
    return { intent: 'EXPRESS_ANGER', confidence: 0.85 };
  }
  if (hasAny(text, ['grazie', 'ringrazio', 'ti ringrazio', 'grazie mille'])) {
    return { intent: 'THANK', confidence: 0.9 };
  }
  if (hasAny(text, ['scusa', 'mi dispiace', 'chiedo scusa', 'perdon'])) {
    return { intent: 'APOLOGIZE', confidence: 0.88 };
  }
  if (hasAny(text, ['arrivederci', 'a presto', 'devo andare', 'devo scappare', 'ci sentiamo', 'a dopo'])) {
    return { intent: 'FAREWELL', confidence: 0.86 };
  }
  if (
    hasAny(text, ['ciao', 'hey', 'ehi', 'salve', 'buongiorno', 'buonasera', 'buonanotte', 'come stai', 'come va'])
  ) {
    return { intent: 'GREETING', confidence: 0.84 };
  }
  if (hasAny(text, ['vieni', 'usciamo', 'andiamo', 'ti va', 'facciamo', 'passa a', 'prendiamo un'])) {
    return { intent: 'INVITATION', confidence: 0.82 };
  }
  if (hasAny(text, ['puoi', 'potresti', 'mi aiuti', 'aiuto', 'favor', 'serve un'])) {
    return { intent: 'REQUEST', confidence: 0.8 };
  }
  if (hasAny(text, ['conosci', 'sai']) && hasAny(text, ['lavoro', 'posto', 'impiego'])) {
    return { intent: 'REQUEST', confidence: 0.85 };
  }
  if (hasAny(text, ['si', 'sì', 'ok', 'va bene', 'certo', 'd accordo', 'perfetto', 'assolutamente'])) {
    return { intent: 'AGREE', confidence: 0.78 };
  }
  if (hasAny(text, ['no', 'non posso', 'impossibile', 'lascia perdere', 'non oggi', 'passo'])) {
    return { intent: 'REFUSE', confidence: 0.8 };
  }
  if (hasAny(text, ['bravo', 'brava', 'bello', 'bella', 'fantastico', 'complimenti', 'mitico', 'forte'])) {
    return { intent: 'COMPLIMENT', confidence: 0.82 };
  }
  if (hasAny(text, ['scherzo', 'ah ah', 'ahah', 'preso in giro', 'dai su'])) {
    return { intent: 'TEASE', confidence: 0.75 };
  }
  if (hasAny(text, ['attenzione', 'stai attento', 'occhio', 'guarda che'])) {
    return { intent: 'WARN', confidence: 0.76 };
  }
  if (hasAny(text, ['wow', 'davvero', 'incredibile', 'non ci credo', ' sul serio'])) {
    return { intent: 'SURPRISE', confidence: 0.74 };
  }
  if (text.includes('?') || hasAny(text, ['come', 'cosa', 'perche', 'quando', 'dove', 'chi ', 'quanto', 'perché'])) {
    return { intent: 'QUESTION', confidence: 0.8 };
  }
  if (text.length >= 8) {
    return { intent: 'ANSWER', confidence: 0.55 };
  }

  return { intent: 'UNKNOWN', confidence: 0.35 };
}
