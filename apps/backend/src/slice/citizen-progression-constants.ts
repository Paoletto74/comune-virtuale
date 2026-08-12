/**
 * Citizen main-track progression — configurable thresholds and editorial level-up copy.
 * progressionPoints = global XP (permanent, never consumed).
 */

export const MAX_MAIN_LEVEL = 20;

/** Points required to reach each level (level 1 starts at 0). */
export const LEVEL_POINT_THRESHOLDS: Readonly<Record<number, number>> = {
  1: 0,
  2: 100,
  3: 300,
  4: 700,
  5: 1_300,
  6: 2_100,
  7: 3_200,
  8: 4_600,
  9: 6_300,
  10: 11_000,
  11: 14_000,
  12: 17_500,
  13: 21_500,
  14: 26_000,
  15: 31_000,
  16: 37_000,
  17: 44_000,
  18: 52_000,
  19: 62_000,
  20: 75_000,
};

export const TASK_PROGRESSION_BY_COMPLEXITY = {
  everyday: 25,
  moderate: 40,
  demanding: 60,
} as const;

export const FLASH_OPPORTUNITY_PROGRESSION_POINTS = 75;
export const NPC_FIRST_MEETING_PROGRESSION_POINTS = 15;
export const LIFE_REVIEW_PROGRESSION_POINTS = 30;
export const REFERENDUM_VOTE_PROGRESSION_POINTS = 20;
export const JOB_CLOCK_IN_PROGRESSION_POINTS = 25;
export const JOB_SHIFT_PAYROLL_PROGRESSION_POINTS = 30;
export const MARKETPLACE_PURCHASE_PROGRESSION_POINTS = 15;

/** Future hook: minimum level gates for content (not enforced in selection yet). */
export function meetsMinimumLevel(citizenLevel: number, requiredLevel: number): boolean {
  return citizenLevel >= requiredLevel;
}

export function resolveMainLevelId(level: number): string {
  const clamped = Math.max(1, Math.min(MAX_MAIN_LEVEL, level));
  return `main_L${String(clamped).padStart(2, '0')}`;
}

export function resolveLevelFromPoints(points: number): number {
  let level = 1;
  for (let candidate = MAX_MAIN_LEVEL; candidate >= 1; candidate -= 1) {
    const threshold = LEVEL_POINT_THRESHOLDS[candidate] ?? 0;
    if (points >= threshold) {
      level = candidate;
      break;
    }
  }
  return level;
}

export function resolveNextLevelThreshold(currentLevel: number): number | null {
  if (currentLevel >= MAX_MAIN_LEVEL) return null;
  return LEVEL_POINT_THRESHOLDS[currentLevel + 1] ?? null;
}

export function resolveCurrentLevelThreshold(level: number): number {
  return LEVEL_POINT_THRESHOLDS[level] ?? 0;
}

export function resolveProgressToNextLevel(points: number, level: number): number | null {
  const nextThreshold = resolveNextLevelThreshold(level);
  if (nextThreshold === null) return null;
  const currentThreshold = resolveCurrentLevelThreshold(level);
  const span = nextThreshold - currentThreshold;
  if (span <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round(((points - currentThreshold) / span) * 100)));
}

/** Minimum global XP to preserve a previously earned level after threshold changes. */
export function resolveProgressionFloorForLevel(level: number): number {
  return LEVEL_POINT_THRESHOLDS[Math.max(1, Math.min(MAX_MAIN_LEVEL, level))] ?? 0;
}

function editorialHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export const LEVEL_UP_MESSAGES: Readonly<Record<number, readonly string[]>> = {
  2: [
    'Ce l\'hai fatta. Non chiedermi come.',
    'Il Comune ha aggiornato il tuo fascicolo. Tu continua a fingere di non sapere perché.',
  ],
  3: [
    'Non sei più un volto nuovo. Il Comune lo sa. Tu forse no.',
    'Hai smesso di sembrare temporaneo. Qualcuno se n\'è accorto.',
  ],
  4: [
    'Il Comune inizia a trattarti come parte del paesaggio urbano.',
    'Le tue scelte lasciano tracce leggibili. Il Comune le legge con calma.',
  ],
  5: [
    'Sei diventato una voce riconoscibile nei corridoi amministrativi.',
    'Il Comune ha aggiornato il tuo fascicolo. Non ti mostrerà la versione completa.',
  ],
  6: [
    'Le porte non si aprono da sole, ma qualcuno ha smesso di chiuderle in faccia.',
    'Hai accumulato abbastanza storia da non essere più un caso isolato.',
  ],
  7: [
    'Il Comune ti osserva con la familiarità di chi sa già come reagirai.',
    'Non sei ancora indispensabile. Ma sei difficile da ignorare.',
  ],
  8: [
    'Hai radici abbastanza profonde da influenzare il ritmo della giornata.',
    'Il Comune ti concede più margine. Non confonderlo con fiducia.',
  ],
  9: [
    'Sei una presenza stabile nel registro delle cose possibili.',
    'Il Comune ti riconosce come abitante, non come visitatore.',
  ],
  10: [
    'Hai raggiunto una forma di consolidamento rara. Il Comune prende nota.',
    'Non sei al vertice. Sei semplicemente diventato parte del sistema.',
  ],
  11: [
    'Sei salito di livello. Il conto in banca non sembra essersene accorto.',
    'Il Comune ti concede un altro centimetro di credibilità. Non spenderlo tutto subito.',
  ],
  12: [
    'A questo punto le tue abitudini sono dati statistici.',
    'Qualcuno ha iniziato a citarti come esempio. Non necessariamente positivo.',
  ],
  13: [
    'Il Comune sa dove trovarti. Anche quando non ci sei.',
    'Hai superato la soglia in cui sparire sarebbe sospetto.',
  ],
  14: [
    'Le tue scelte pesano abbastanza da lasciare impronte sui report interni.',
    'Non sei una leggenda. Sei qualcosa di peggio: una costante.',
  ],
  15: [
    'Il Comune ti tratta come un dato consolidato, non come un\'anomalia.',
    'Hai accumulato abbastanza XP da far sembrare serio persino il tuo caos.',
  ],
  16: [
    'A questo livello, anche l\'inerzia ha un nome e cognome.',
    'Il sistema ti riconosce. Non confondere riconoscimento con affetto.',
  ],
  17: [
    'Sei diventato difficile da rimuovere senza lasciare buchi evidenti.',
    'Il Comune ha smesso di chiedersi se resterai. Si chiede solo come.',
  ],
  18: [
    'Hai raggiunto una densità narrativa che i manuali definirebbero "esperto".',
    'Il Comune ti osserva con rispetto professionale. Quello che si riserva ai problemi ricorrenti.',
  ],
  19: [
    'Mancano pochi passi al massimo. Il Comune non applaude. Prende appunti.',
    'Sei così radicato che cambiare rotta richiederebbe una delibera.',
  ],
  20: [
    'Livello massimo. Il Comune ammette che sei abbastanza bravo nel tuo percorso.',
    'Hai raggiunto il tetto. Da qui in su c\'è solo il cielo amministrativo. Buona fortuna.',
  ],
};

export function resolveLevelUpMessage(citizenId: string, level: number): string {
  const messages = LEVEL_UP_MESSAGES[level];
  if (!messages || messages.length === 0) {
    return `Livello ${level}. Il Comune ha aggiornato il tuo fascicolo.`;
  }
  return messages[editorialHash(`${citizenId}:${level}`) % messages.length]!;
}

export function resolveLevelUpTitle(level: number): string {
  return `Sei salito al livello ${level}`;
}
