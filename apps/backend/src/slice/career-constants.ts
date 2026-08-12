/**
 * Career tracks — configurable grades and affinity rules (Phase 1 data model).
 * Grade advancement mechanics arrive in later phases.
 */

export const CAREER_SWITCH_MIN_AFFINITY_DELTA = 15;

/** Minimum significant actions before a career switch can stick. */
export const CAREER_SWITCH_MIN_SIGNIFICANT_ACTIONS = 5;

export const DEMO_CAREER_IDS = ['medicina', 'motorsport', 'criminalita'] as const;

export type DemoCareerId = (typeof DEMO_CAREER_IDS)[number];

export interface CareerDefinition {
  careerId: DemoCareerId;
  label: string;
  grades: readonly string[];
}

export const CAREER_DEFINITIONS: Readonly<Record<DemoCareerId, CareerDefinition>> = {
  medicina: {
    careerId: 'medicina',
    label: 'MEDICINA',
    grades: [
      'OSSERVATORE',
      'STAGISTA',
      'ASSISTENTE',
      'TURNISTA',
      'PRIMARIO',
      'SPECIALISTA',
      'REFERENTE',
      'CAPOSALA',
      'DIRIGENTE',
      'SENIOR',
      'DOCENTE',
      'CONSULENTE',
      'EPIDEMIOLOGO',
      'MEDICO LEGALE',
      'CHIRURGO',
      'REPARTO CHIAVE',
      'DIRETTORE SANITARIO',
      'AUTORITÀ CLINICA',
      'PILASTRO DEL SISTEMA',
      'LEGGENDA DELLA SALUTE',
    ],
  },
  motorsport: {
    careerId: 'motorsport',
    label: 'MOTORSPORT',
    grades: [
      'APPASSIONATO',
      'MECCANICO',
      'PILOTA AMATORIALE',
      'TEST DRIVER',
      'PILOTA GT',
      'PILOTA PROTOTIPI',
      'PILOTA AFFIANCATO',
      'PILOTA UFFICIALE',
      'VICE CAMPIONE',
      'CAMPIONE NAZIONALE',
      'PILOTA INTERNAZIONALE',
      'TEAM PRINCIPALE',
      'CAPO SQUADRA',
      'DIRETTORE TECNICO',
      'INGEGNERE CAPO',
      'TEAM PRINCIPAL',
      'LEGENDA DEL CIRCUITO',
      'ICONA DEL MOTORSPORT',
      'PILASTRO DEL TEAM',
      'MITO DELLA PISTA',
    ],
  },
  criminalita: {
    careerId: 'criminalita',
    label: 'CRIMINALITÀ',
    grades: [
      'OCCASIONALE',
      'MESSENGER',
      'GUARDIANO',
      'TRUFFATORE',
      'RACCOLTA',
      'INTERMEDIARIO',
      'CAPO SQUADRA',
      'CONSIGLIERE',
      'CAPO ZONA',
      'BRACCIO DESTRO',
      'REGOLATORE',
      'FACCIATA',
      'STRATEGA',
      'PATRON LOCALE',
      'PATRON REGIONALE',
      'ARCHITETTO',
      'PILASTRO DELL\'OMBRA',
      'LEGENDA DELLA STRADA',
      'FANTASMA URBANO',
      'MITO DEL SOTTOBOSCO',
    ],
  },
};

export const MAX_CAREER_GRADE = 20;

export function resolveCareerDefinition(careerId: string): CareerDefinition | null {
  if (careerId in CAREER_DEFINITIONS) {
    return CAREER_DEFINITIONS[careerId as DemoCareerId];
  }
  return null;
}

export function resolveCareerGradeLabel(careerId: string, gradeIndex: number): string | null {
  const def = resolveCareerDefinition(careerId);
  if (!def) return null;
  const clamped = Math.max(1, Math.min(MAX_CAREER_GRADE, gradeIndex));
  return def.grades[clamped - 1] ?? null;
}

export function resolveCareerGradeIndex(careerId: string, gradeIndex: number): number {
  return Math.max(1, Math.min(MAX_CAREER_GRADE, gradeIndex));
}

export function clampAffinity(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export interface EmergingTrajectory {
  careerId: DemoCareerId;
  score: number;
  lastUpdatedAt: string;
}
