export interface CitizenMetricSnapshot {
  balanceMinor: number;
  sympathy: number;
  reputation: number;
  level: number;
  occupationLabel?: string;
  housingLabel?: string;
  storyThreadsCompleted?: number;
  storyThreadsAbandoned?: number;
  recurringSocialThreads?: number;
}

export interface ContradictionSignal {
  id: string;
  priority: number;
  positiveResult: string;
  observation: string;
  ironicContrast: string;
}

const BALANCE_HIGH_MINOR = 300_00;
const BALANCE_LOW_MINOR = 50_00;
const REPUTATION_HIGH = 5;
const REPUTATION_LOW = 1;
const SYMPATHY_HIGH = 5;
const LEVEL_HIGH = 4;

export function detectPrimaryContradiction(snapshot: CitizenMetricSnapshot): ContradictionSignal | null {
  const signals: ContradictionSignal[] = [];

  if (snapshot.balanceMinor >= BALANCE_HIGH_MINOR && snapshot.reputation <= REPUTATION_LOW) {
    signals.push({
      id: 'rich_unloved',
      priority: 90,
      positiveResult: 'Il tuo saldo continua a crescere.',
      observation: 'La tua reputazione, meno.',
      ironicContrast:
        'Ma non preoccuparti. Almeno una delle due cose è chiaramente sotto controllo.',
    });
  }

  if (snapshot.reputation >= REPUTATION_HIGH && snapshot.balanceMinor <= BALANCE_LOW_MINOR) {
    signals.push({
      id: 'respected_broke',
      priority: 88,
      positiveResult: 'Sei molto rispettato.',
      observation: 'Peccato che il rispetto non paghi le bollette.',
      ironicContrast: 'Il Comune ammira la coerenza, anche quando è costosa.',
    });
  }

  if (snapshot.sympathy >= SYMPATHY_HIGH && snapshot.reputation <= REPUTATION_LOW) {
    signals.push({
      id: 'liked_not_respected',
      priority: 85,
      positiveResult: 'Piaci alle persone.',
      observation: 'La città, nel complesso, sembra avere un\'opinione diversa.',
      ironicContrast: 'Popolarità locale, reputazione municipale: due mercati distinti.',
    });
  }

  if (snapshot.level >= LEVEL_HIGH && snapshot.balanceMinor <= BALANCE_LOW_MINOR) {
    signals.push({
      id: 'high_level_poor',
      priority: 80,
      positiveResult: `Sei arrivato lontano. Livello ${snapshot.level}.`,
      observation: 'La domanda è: dove?',
      ironicContrast: 'Il progresso è reale. Il conto in banca fa domande pertinenti.',
    });
  }

  if ((snapshot.storyThreadsAbandoned ?? 0) >= 2 && (snapshot.recurringSocialThreads ?? 0) >= 1) {
    signals.push({
      id: 'unfinished_social_threads',
      priority: 72,
      positiveResult: 'Hai lasciato alcune storie a metà.',
      observation: 'In città, le porte socchiuse finiscono per richiudersi da sole.',
      ironicContrast: 'Il Comune non giudica. Il Comune archivia.',
    });
  }

  if (signals.length === 0) return null;
  return signals.sort((a, b) => b.priority - a.priority)[0] ?? null;
}

export function buildDefaultLifeReview(snapshot: CitizenMetricSnapshot): ContradictionSignal {
  const balanceEuro = (snapshot.balanceMinor / 100).toFixed(0);
  return {
    id: 'steady_progress',
    priority: 10,
    positiveResult: 'Stai facendo progressi.',
    observation: `Livello ${snapshot.level}. €${balanceEuro}. Reputazione ${snapshot.reputation >= 0 ? 'discreta' : 'migliorabile'}.`,
    ironicContrast: 'A questo ritmo rischi addirittura di diventare soddisfatto.',
  };
}
