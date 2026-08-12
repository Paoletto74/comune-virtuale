import type { TaskProductRequirementDef } from './product-requirements-constants.js';

/**
 * Task → product requirements.
 * Checked only when starting a pending task; active tasks are not interrupted.
 */
export const TASK_PRODUCT_REQUIREMENTS: Readonly<Record<string, TaskProductRequirementDef>> = {
  DEMO_V2_PARKING_TICKET: {
    requirement: { kind: 'category', categoryId: 'vehicles', label: 'Veicolo' },
  },
  DEMO_V2_FAMILY_UNEXPECTED_VISIT: {
    requirement: { kind: 'category', categoryId: 'housing', label: 'Abitazione' },
  },
  DEMO_V2_FAMILY_HOME_REPAIR: {
    requirement: { kind: 'category', categoryId: 'housing', label: 'Abitazione' },
  },
  DEMO_V2_WORK_CLIENT_ANGER: {
    requirement: {
      kind: 'anyOf',
      label: 'Veicolo premium o di lusso',
      options: [
        {
          kind: 'economicTier',
          categoryId: 'vehicles',
          minTier: 'PREMIUM',
          label: 'Veicolo premium',
        },
        {
          kind: 'economicTier',
          categoryId: 'vehicles',
          minTier: 'LUSSO',
          label: 'Veicolo di lusso',
        },
        {
          kind: 'economicTier',
          categoryId: 'vehicles',
          minTier: 'SUPER-LUSSO',
          label: 'Veicolo di lusso',
        },
      ],
    },
  },
  DEMO_V2_ECON_FLIP_OFFER: {
    requirement: { kind: 'category', categoryId: 'luxury', label: 'Bene di lusso' },
  },
  DEMO_V3_UNEXPECTED_WRONG_DELIVERY: {
    requirement: { kind: 'category', categoryId: 'vehicles', label: 'Veicolo' },
  },
  DEMO_V3_WORK_LUNCH_DEBT: {
    requirement: { kind: 'consumableFood', label: 'Pasto o alimento' },
    consumeOnStart: true,
  },
  DEMO_V3_WORK_TEAM_LUNCH: {
    requirement: { kind: 'consumableFood', label: 'Pasto o alimento' },
    consumeOnStart: true,
  },
};

export function getTaskProductRequirement(taskId: string): TaskProductRequirementDef | null {
  return TASK_PRODUCT_REQUIREMENTS[taskId] ?? null;
}
