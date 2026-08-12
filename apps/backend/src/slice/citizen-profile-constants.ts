/**
 * Citizen identity profile — runtime codes stored in citizen_personal_values (integer EAV).
 * No schema migration: extend via new valueKey entries in future slices.
 */

export const PROFILE_VALUE_KEYS = {
  occupation: 'profile_occupation',
  housing: 'profile_housing',
  family: 'profile_family',
  tasksCompleted: 'profile_tasks_completed',
  workTasksCompleted: 'profile_work_tasks',
  unlockWork: 'unlock_work',
  unlockLiving: 'unlock_living',
  unlockPersonal: 'unlock_personal',
} as const;

export const OCCUPATION_CODES = {
  impiegato: 1,
  commerciante: 2,
  freelance: 3,
  studente: 4,
  insegnante: 5,
  tecnico: 6,
  professionista: 7,
  disoccupato: 8,
  pensionato: 9,
} as const;

export const HOUSING_CODES = {
  affitto: 1,
  proprieta: 2,
  conFamiglia: 3,
  coinquilini: 4,
  temporaneo: 5,
} as const;

export const FAMILY_CODES = {
  single: 1,
  coppia: 2,
  famigliaFigli: 3,
  famigliaNumerosa: 4,
  viveConGenitori: 5,
} as const;

export const OCCUPATION_LABELS: Record<number, string> = {
  [OCCUPATION_CODES.impiegato]: 'Impiegato',
  [OCCUPATION_CODES.commerciante]: 'Commerciante',
  [OCCUPATION_CODES.freelance]: 'Freelance',
  [OCCUPATION_CODES.studente]: 'Studente',
  [OCCUPATION_CODES.insegnante]: 'Insegnante',
  [OCCUPATION_CODES.tecnico]: 'Tecnico',
  [OCCUPATION_CODES.professionista]: 'Professionista',
  [OCCUPATION_CODES.disoccupato]: 'Disoccupato',
  [OCCUPATION_CODES.pensionato]: 'Pensionato',
};

export const HOUSING_LABELS: Record<number, string> = {
  [HOUSING_CODES.affitto]: 'In affitto',
  [HOUSING_CODES.proprieta]: 'Proprietario',
  [HOUSING_CODES.conFamiglia]: 'Con la famiglia',
  [HOUSING_CODES.coinquilini]: 'Con coinquilini',
  [HOUSING_CODES.temporaneo]: 'Soluzione temporanea',
};

export const FAMILY_LABELS: Record<number, string> = {
  [FAMILY_CODES.single]: 'Single',
  [FAMILY_CODES.coppia]: 'In coppia',
  [FAMILY_CODES.famigliaFigli]: 'Famiglia con figli',
  [FAMILY_CODES.famigliaNumerosa]: 'Famiglia numerosa',
  [FAMILY_CODES.viveConGenitori]: 'Vive con i genitori',
};

export type ProfileDimensionId = 'work' | 'living' | 'personal';

export const PROFILE_DIMENSIONS: Record<
  ProfileDimensionId,
  { label: string; lockedHint: string }
> = {
  work: {
    label: 'Lavoro',
    lockedHint: 'Emergerà vivendo il lavoro quotidiano nel Comune.',
  },
  living: {
    label: 'Abitazione',
    lockedHint: 'Si scoprirà man mano che ti radichi in città.',
  },
  personal: {
    label: 'Vita personale',
    lockedHint: 'Richiede una certa familiarità con il Comune.',
  },
};

export const WORK_TASK_ID_PATTERNS = [
  '_WORK_',
  'WORK_',
  'BOSS_',
  'SUPPLIER_',
  'CLIENT_',
  'COLLEAGUE_',
  'DEADLINE_',
  'SUPERVISOR_',
  'SHIFT_',
  'MEETING_',
] as const;

export function isWorkTaskDefinitionId(definitionId: string): boolean {
  const upper = definitionId.toUpperCase();
  return WORK_TASK_ID_PATTERNS.some((pattern) => upper.includes(pattern));
}

export function resolveLevelLabel(level: number): string {
  if (level <= 1) return 'Nuovo in città';
  if (level === 2) return 'Conosciuto in paese';
  if (level === 3) return 'Stabilmente in città';
  if (level === 4) return 'Radicato nel Comune';
  if (level === 5) return 'Riconosciuto dal Comune';
  if (level === 6) return 'Presenza consolidata';
  if (level === 7) return 'Figura nota';
  if (level === 8) return 'Pilastro di quartiere';
  if (level === 9) return 'Voce autorevole';
  if (level === 10) return 'Figura consolidata';
  if (level <= 14) return 'Presenza stabile';
  if (level <= 17) return 'Veterano del Comune';
  if (level <= 19) return 'Pilastro urbano';
  return 'Livello massimo';
}

export function resolveAgeBand(age: number): string {
  if (age <= 25) return 'Giovane adulto';
  if (age <= 40) return 'Adulto';
  if (age <= 55) return 'Mezza età';
  if (age <= 64) return 'Maturità';
  return 'Senior';
}

function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Deterministic, age-coherent profile assignment — not a random generator. */
export function assignProfileCodes(citizenId: string, age: number): {
  occupation: number;
  housing: number;
  family: number;
} {
  const bucket = simpleHash(citizenId) % 100;

  if (age >= 65) {
    return {
      occupation: OCCUPATION_CODES.pensionato,
      housing: bucket < 60 ? HOUSING_CODES.proprieta : HOUSING_CODES.affitto,
      family:
        bucket < 40
          ? FAMILY_CODES.coppia
          : bucket < 70
            ? FAMILY_CODES.single
            : FAMILY_CODES.famigliaFigli,
    };
  }

  if (age <= 24) {
    return {
      occupation: bucket < 50 ? OCCUPATION_CODES.studente : OCCUPATION_CODES.freelance,
      housing:
        bucket < 40
          ? HOUSING_CODES.conFamiglia
          : bucket < 75
            ? HOUSING_CODES.affitto
            : HOUSING_CODES.coinquilini,
      family: bucket < 60 ? FAMILY_CODES.single : FAMILY_CODES.viveConGenitori,
    };
  }

  if (age >= 56) {
    const occupations = [
      OCCUPATION_CODES.impiegato,
      OCCUPATION_CODES.insegnante,
      OCCUPATION_CODES.tecnico,
      OCCUPATION_CODES.professionista,
      OCCUPATION_CODES.pensionato,
    ];
    return {
      occupation: occupations[bucket % occupations.length]!,
      housing: bucket < 50 ? HOUSING_CODES.proprieta : HOUSING_CODES.affitto,
      family:
        bucket < 35
          ? FAMILY_CODES.famigliaFigli
          : bucket < 65
            ? FAMILY_CODES.coppia
            : FAMILY_CODES.single,
    };
  }

  const occupations = [
    OCCUPATION_CODES.impiegato,
    OCCUPATION_CODES.commerciante,
    OCCUPATION_CODES.freelance,
    OCCUPATION_CODES.insegnante,
    OCCUPATION_CODES.tecnico,
    OCCUPATION_CODES.professionista,
  ];

  if (bucket < 8) {
    return {
      occupation: OCCUPATION_CODES.disoccupato,
      housing: HOUSING_CODES.affitto,
      family: FAMILY_CODES.single,
    };
  }

  return {
    occupation: occupations[(bucket - 8) % occupations.length]!,
    housing:
      bucket < 45
        ? HOUSING_CODES.affitto
        : bucket < 75
          ? HOUSING_CODES.proprieta
          : HOUSING_CODES.coinquilini,
    family:
      bucket < 30
        ? FAMILY_CODES.single
        : bucket < 55
          ? FAMILY_CODES.coppia
          : bucket < 80
            ? FAMILY_CODES.famigliaFigli
            : FAMILY_CODES.famigliaNumerosa,
  };
}

export function buildInitialProfileValues(citizenId: string, age: number): Record<string, number> {
  const codes = assignProfileCodes(citizenId, age);
  return {
    [PROFILE_VALUE_KEYS.occupation]: codes.occupation,
    [PROFILE_VALUE_KEYS.housing]: codes.housing,
    [PROFILE_VALUE_KEYS.family]: codes.family,
    [PROFILE_VALUE_KEYS.tasksCompleted]: 0,
    [PROFILE_VALUE_KEYS.workTasksCompleted]: 0,
    [PROFILE_VALUE_KEYS.unlockWork]: 0,
    [PROFILE_VALUE_KEYS.unlockLiving]: 0,
    [PROFILE_VALUE_KEYS.unlockPersonal]: 0,
  };
}
