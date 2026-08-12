/**
 * Flash Opportunities — spawn config, templates, and admin overrides.
 * Decision window uses REAL TIME; timing mode abstraction reserved for future game-time use.
 */

import type { CitizenProfileContext } from '../application/citizen/citizen-profile-service.js';
import { DEMO_STEAL_WALLET_RISK_BRANCHES } from './risk-constants.js';

export type FlashOpportunityType =
  | 'economic'
  | 'work'
  | 'social'
  | 'risky'
  | 'criminal'
  | 'special';

export type FlashOpportunityStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'cancelled';

export type FlashTimingMode = 'real_time' | 'game_time';

export interface FlashOpportunityEffects {
  sympathy?: number;
  reputation?: number;
  cashDeltaMinor?: bigint;
  cashReason?: string;
}

export interface FlashOpportunityTemplate {
  templateId: string;
  type: FlashOpportunityType;
  title: string;
  body: string;
  comuneLine?: string;
  rewardPreview: string;
  acceptEffects: FlashOpportunityEffects;
  declineEffects?: FlashOpportunityEffects;
  expiredNotice?: string;
  riskSpecRef?: string;
  riskExposureLevel?: 'low' | 'medium' | 'high';
  npcTemplateId?: string;
  baseWeight: number;
  /** Soft multiplier from profile/NPC context (never zero for generic templates). */
  score?: (input: {
    profile: CitizenProfileContext;
    knownNpcTemplateIds: Set<string>;
    relationshipLevels: Map<string, number>;
  }) => number;
}

export interface FlashOpportunityConfig {
  enabled: boolean;
  timingMode: FlashTimingMode;
  minDecisionDurationMs: number;
  maxDecisionDurationMs: number;
  minAnticipationDurationMs: number;
  maxAnticipationDurationMs: number;
  minSpawnIntervalMs: number;
  maxSpawnIntervalMs: number;
  opportunityChance: number;
  maxActive: number;
}

export const DEFAULT_FLASH_OPPORTUNITY_CONFIG: FlashOpportunityConfig = {
  enabled: true,
  timingMode: 'real_time',
  minDecisionDurationMs: 5_000,
  maxDecisionDurationMs: 15_000,
  minAnticipationDurationMs: 5 * 60_000,
  maxAnticipationDurationMs: 15 * 60_000,
  minSpawnIntervalMs: 10 * 60_000,
  maxSpawnIntervalMs: 30 * 60_000,
  opportunityChance: 0.35,
  maxActive: 1,
};

let runtimeFlashConfig: FlashOpportunityConfig = { ...DEFAULT_FLASH_OPPORTUNITY_CONFIG };

export function getFlashOpportunityConfig(): FlashOpportunityConfig {
  return runtimeFlashConfig;
}

export function setFlashOpportunityConfig(partial: Partial<FlashOpportunityConfig>): FlashOpportunityConfig {
  runtimeFlashConfig = { ...runtimeFlashConfig, ...partial };
  return runtimeFlashConfig;
}

export function resetFlashOpportunityConfig(): void {
  runtimeFlashConfig = { ...DEFAULT_FLASH_OPPORTUNITY_CONFIG };
}

export const FLASH_RISKY_DEAL_RISK_REF = 'FLASH_RISKY_DEAL_RISK';
export const FLASH_CRIMINAL_DOOR_RISK_REF = 'FLASH_CRIMINAL_DOOR_RISK';

export const FLASH_RISK_BRANCHES = [...DEMO_STEAL_WALLET_RISK_BRANCHES];

export const FLASH_RISK_MESSAGE_KEYS: Record<string, Record<string, string>> = {
  [FLASH_RISKY_DEAL_RISK_REF]: {
    witnessed: 'slice.flash.risk.deal.audit',
    identified: 'slice.flash.risk.deal.penalty',
  },
  [FLASH_CRIMINAL_DOOR_RISK_REF]: {
    witnessed: 'slice.flash.risk.door.witnessed',
    identified: 'slice.flash.risk.door.identified',
  },
};

export const ANTICIPATION_LABELS = [
  'Il Comune sta preparando qualcosa...',
  'Qualcosa si sta muovendo.',
  'Potrebbe succedere qualcosa.',
  'Sta arrivando un\'opportunità.',
] as const;

export const FLASH_ECONOMIC_DELIVERY = 'FLASH_ECONOMIC_DELIVERY';
export const FLASH_WORK_URGENT = 'FLASH_WORK_URGENT';
export const FLASH_SOCIAL_FAVOR = 'FLASH_SOCIAL_FAVOR';
export const FLASH_RISKY_DEAL = 'FLASH_RISKY_DEAL';
export const FLASH_CRIMINAL_SIDE_DOOR = 'FLASH_CRIMINAL_SIDE_DOOR';
export const FLASH_SPECIAL_COMUNE = 'FLASH_SPECIAL_COMUNE';
export const FLASH_NPC_MARCO = 'FLASH_NPC_MARCO';
export const FLASH_NPC_LAURA = 'FLASH_NPC_LAURA';
export const FLASH_NPC_GIULIA = 'FLASH_NPC_GIULIA';

export const FLASH_OPPORTUNITY_TEMPLATES: readonly FlashOpportunityTemplate[] = [
  {
    templateId: FLASH_ECONOMIC_DELIVERY,
    type: 'economic',
    title: 'Consegna immediata',
    body: 'Un cliente ha bisogno di una consegna immediata.',
    comuneLine: '€150 in pochi secondi. Il Comune non giudica. Il Comune registra.',
    rewardPreview: '+€145',
    acceptEffects: { cashDeltaMinor: 145n, cashReason: 'FLASH_ECONOMIC_DELIVERY' },
    expiredNotice:
      'Troppo tardi. L\'occasione è passata. Il Comune non ha intenzione di fingere che sia colpa sua.',
    baseWeight: 1.0,
  },
  {
    templateId: FLASH_WORK_URGENT,
    type: 'work',
    title: 'Copertura urgente',
    body: 'Serve qualcuno disponibile adesso per un turno extra.',
    rewardPreview: '+€120',
    acceptEffects: { cashDeltaMinor: 120n, cashReason: 'FLASH_WORK_URGENT', reputation: 1 },
    baseWeight: 0.9,
    score: ({ profile }) => (profile.unlockedDimensions.includes('work') ? 1.35 : 0.85),
  },
  {
    templateId: FLASH_SOCIAL_FAVOR,
    type: 'social',
    title: 'Un favore veloce',
    body: 'Qualcuno in città chiede una mano, adesso.',
    rewardPreview: '+Simpatia',
    acceptEffects: { sympathy: 1 },
    declineEffects: { sympathy: 1, reputation: 1 },
    baseWeight: 0.85,
    score: ({ profile }) => (profile.sympathy >= 3 ? 1.2 : 1.0),
  },
  {
    templateId: FLASH_RISKY_DEAL,
    type: 'risky',
    title: 'Affare conveniente',
    body: 'Un affare molto conveniente. Nessuna domanda inutile.',
    comuneLine: 'Potresti guadagnare facilmente. Naturalmente c\'è un motivo.',
    rewardPreview: '+€300',
    acceptEffects: { cashDeltaMinor: 300n, cashReason: 'FLASH_RISKY_DEAL' },
    riskSpecRef: FLASH_RISKY_DEAL_RISK_REF,
    riskExposureLevel: 'medium',
    baseWeight: 0.55,
  },
  {
    templateId: FLASH_CRIMINAL_SIDE_DOOR,
    type: 'criminal',
    title: 'Porta laterale',
    body: 'Una porta laterale è aperta. Nessuno sembra guardare.',
    rewardPreview: '+€180',
    acceptEffects: { cashDeltaMinor: 180n, cashReason: 'FLASH_CRIMINAL_SIDE_DOOR' },
    riskSpecRef: FLASH_CRIMINAL_DOOR_RISK_REF,
    riskExposureLevel: 'high',
    baseWeight: 0.35,
  },
  {
    templateId: FLASH_SPECIAL_COMUNE,
    type: 'special',
    title: 'Circolare interna',
    body: 'Il Comune segnala un\'occasione fuori programma.',
    comuneLine: 'Un\'occasione. Perché evidentemente la tranquillità non faceva per te.',
    rewardPreview: '+€80',
    acceptEffects: { cashDeltaMinor: 80n, cashReason: 'FLASH_SPECIAL_COMUNE' },
    baseWeight: 0.7,
  },
  {
    templateId: FLASH_NPC_MARCO,
    type: 'social',
    title: 'Marco ti scrive',
    body: 'Marco ha bisogno di una mano immediatamente.',
    rewardPreview: '+€120',
    acceptEffects: { cashDeltaMinor: 120n, cashReason: 'FLASH_NPC_MARCO', sympathy: 1 },
    npcTemplateId: 'neighbor_marco',
    baseWeight: 0.6,
    score: ({ knownNpcTemplateIds, relationshipLevels }) =>
      knownNpcTemplateIds.has('neighbor_marco')
        ? 1.2 + Math.max(0, relationshipLevels.get('neighbor_marco') ?? 0) * 0.05
        : 0.2,
  },
  {
    templateId: FLASH_NPC_LAURA,
    type: 'work',
    title: 'Laura in ufficio',
    body: 'Laura ti cerca per una urgenza di lavoro.',
    rewardPreview: '+€110',
    acceptEffects: { cashDeltaMinor: 110n, cashReason: 'FLASH_NPC_LAURA', reputation: 1 },
    npcTemplateId: 'colleague_laura',
    baseWeight: 0.55,
    score: ({ knownNpcTemplateIds, relationshipLevels }) =>
      knownNpcTemplateIds.has('colleague_laura')
        ? 1.15 + Math.max(0, relationshipLevels.get('colleague_laura') ?? 0) * 0.04
        : 0.2,
  },
  {
    templateId: FLASH_NPC_GIULIA,
    type: 'social',
    title: 'Giulia ti chiama',
    body: 'Giulia ti ha lasciato un messaggio urgente.',
    rewardPreview: '+€95',
    acceptEffects: { cashDeltaMinor: 95n, cashReason: 'FLASH_NPC_GIULIA' },
    npcTemplateId: 'acquaintance_giulia',
    baseWeight: 0.5,
    score: ({ knownNpcTemplateIds, relationshipLevels }) =>
      knownNpcTemplateIds.has('acquaintance_giulia')
        ? 1.1 + Math.max(0, relationshipLevels.get('acquaintance_giulia') ?? 0) * 0.03
        : 0.2,
  },
];

export function getFlashOpportunityTemplate(templateId: string): FlashOpportunityTemplate | null {
  return FLASH_OPPORTUNITY_TEMPLATES.find((entry) => entry.templateId === templateId) ?? null;
}

export function flashSpawnIdempotencyKey(citizenId: string, spawnCycle: number): string {
  return `flash_spawn:v1:${citizenId}:${spawnCycle}`;
}

export function flashAcceptIdempotencyKey(opportunityId: string): string {
  return `flash_accept:v1:${opportunityId}`;
}
