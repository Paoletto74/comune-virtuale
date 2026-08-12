export type CitizenArchetype =
  | 'professional'
  | 'worker'
  | 'student'
  | 'teacher'
  | 'merchant'
  | 'technician'
  | 'retiree'
  | 'unemployed'
  | 'generic';

export interface CitizenVisualInput {
  age?: number;
  ageBand?: string;
  occupation?: string;
  gender?: string;
}

const OCCUPATION_PATTERNS: ReadonlyArray<{ pattern: RegExp; archetype: CitizenArchetype }> = [
  { pattern: /disoccup|senza lavoro|in cerca/i, archetype: 'unemployed' },
  { pattern: /pension|ritirat|anzian/i, archetype: 'retiree' },
  { pattern: /insegn|professor|docente|maestr/i, archetype: 'teacher' },
  { pattern: /studente|studia|universit/i, archetype: 'student' },
  { pattern: /commerc|vendit|negoz|mercant/i, archetype: 'merchant' },
  { pattern: /operaio|lavoratore|addett|impiegat/i, archetype: 'worker' },
  { pattern: /tecnico|manutent|fabbric|magazzin/i, archetype: 'technician' },
  { pattern: /manager|dirigent|profession|consulent|avvocat|medico|ingegner/i, archetype: 'professional' },
];

export function resolveCitizenArchetype(input: CitizenVisualInput): CitizenArchetype {
  const occupation = input.occupation?.trim();
  if (occupation) {
    for (const { pattern, archetype } of OCCUPATION_PATTERNS) {
      if (pattern.test(occupation)) return archetype;
    }
  }

  if (input.ageBand?.toLowerCase().includes('anzian') || (input.age !== undefined && input.age >= 65)) {
    return 'retiree';
  }
  if (input.age !== undefined && input.age <= 22) {
    return 'student';
  }

  return 'generic';
}

export function citizenArchetypeLabel(archetype: CitizenArchetype): string {
  const labels: Record<CitizenArchetype, string> = {
    professional: 'Professionista',
    worker: 'Lavoratore',
    student: 'Studente',
    teacher: 'Insegnante',
    merchant: 'Commerciante',
    technician: 'Tecnico',
    retiree: 'Pensionato',
    unemployed: 'Disoccupato',
    generic: 'Cittadino',
  };
  return labels[archetype];
}
