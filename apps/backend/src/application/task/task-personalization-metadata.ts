import { ALL_POOL_ENTRY_DEFINITION_IDS } from './task-pool-registry.js';
import type {
  ComplexityTier,
  MetricBias,
  PersonalizationContextTag,
  TaskPersonalizationMetadata,
} from './task-personalization-types.js';
import type { ProfileDimensionId } from '../../slice/citizen-profile-constants.js';

const WORK_PATTERNS = [
  'WORK',
  'BOSS',
  'SUPPLIER',
  'CLIENT',
  'COLLEAGUE',
  'DEADLINE',
  'MEETING',
  'SHIFT',
  'SUPERVISOR',
  'OVERTIME',
  'OFF_BOOK',
  'SIDE_GIG',
] as const;

const FAMILY_PATTERNS = ['FAMILY'] as const;
const LIVING_PATTERNS = ['LANDLORD', 'NEIGHBORHOOD', 'NEIGHBOR', 'PARKING', 'LEAK', 'REPAIR'] as const;
const SOCIAL_PATTERNS = [
  'SOCIAL',
  'FRIEND',
  'NEIGHBOR',
  'ACQUAINTANCE',
  'CHARITY',
  'ELDERLY',
  'GROUP',
] as const;
const ECONOMIC_PATTERNS = [
  'ECON',
  'WALLET',
  'FOUND',
  'BILL',
  'TIP',
  'FLIP',
  'PARKING',
  'DEBT',
  'PAYMENT',
  'INVOICE',
] as const;
const UNEXPECTED_PATTERNS = ['UNEXPECTED', 'WEIRD', 'PARADE', 'FOUNTAIN', 'AUTOCORRECT', 'FLYAWAY'] as const;
const RISKY_PATTERNS = ['STEAL', 'SHADY', 'SCAM', 'RISKY', 'SUITCASE', 'SHADY_DEAL', 'BRIBE'] as const;
const DIALOGUE_PATTERNS = ['DIALOGUE', 'BOSS_GREETING', 'LANDLORD', 'FRIEND_DEBT'] as const;

const GENERIC_PATTERNS = [
  'ELDERLY',
  'UNEXPECTED',
  'WEIRD',
  'FOUND',
  'NEIGHBOR_FAVOR',
  'CHARITY',
  'PARADE',
  'FOUNTAIN',
  'AUTOCORRECT',
  'FLYAWAY',
  'POWER_OUTAGE',
] as const;

const DEMANDING_PATTERNS = [
  'DIALOGUE',
  'RISKY',
  'BILL_SHOCK',
  'OFF_BOOK',
  'SIDE_GIG',
  'SHADY',
  'STEAL',
  'SCAM',
  'GROUP_TRIP',
  'OVERTIME',
] as const;

const MODERATE_PATTERNS = ['DEADLINE', 'BOSS', 'MEETING', 'SUPPLIER', 'ECON', 'LANDLORD', 'DEBT'] as const;

/** Optional overrides for tasks whose ID patterns are ambiguous. */
const METADATA_OVERRIDES: Partial<
  Record<string, Partial<Omit<TaskPersonalizationMetadata, 'definitionId'>>>
> = {
  DEMO_ELDERLY_CROSSING: {
    generic: true,
    contexts: ['social', 'generic'],
    primaryContext: 'generic',
  },
  DEMO_NEIGHBOR_FAVOR: {
    generic: true,
    contexts: ['social', 'living', 'generic'],
    primaryContext: 'generic',
  },
  DEMO_FOUND_WALLET: {
    generic: true,
    contexts: ['economic', 'generic'],
    primaryContext: 'generic',
  },
  DEMO_SUITCASE_OFFER: {
    contexts: ['risky', 'social'],
    primaryContext: 'risky',
    generic: false,
  },
};

function matchesAny(id: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => id.includes(pattern));
}

function inferContexts(definitionId: string): PersonalizationContextTag[] {
  const id = definitionId.toUpperCase();
  const contexts = new Set<PersonalizationContextTag>();

  if (matchesAny(id, DIALOGUE_PATTERNS)) contexts.add('dialogue');
  if (matchesAny(id, WORK_PATTERNS)) contexts.add('work');
  if (matchesAny(id, FAMILY_PATTERNS)) contexts.add('family');
  if (matchesAny(id, LIVING_PATTERNS)) contexts.add('living');
  if (matchesAny(id, SOCIAL_PATTERNS)) contexts.add('social');
  if (matchesAny(id, ECONOMIC_PATTERNS)) contexts.add('economic');
  if (matchesAny(id, UNEXPECTED_PATTERNS)) contexts.add('unexpected');
  if (matchesAny(id, RISKY_PATTERNS)) contexts.add('risky');

  if (contexts.size === 0) {
    contexts.add('generic');
  }

  return [...contexts];
}

function inferPrimaryContext(contexts: PersonalizationContextTag[]): PersonalizationContextTag {
  const priority: PersonalizationContextTag[] = [
    'dialogue',
    'work',
    'family',
    'living',
    'economic',
    'social',
    'risky',
    'unexpected',
    'generic',
  ];

  for (const tag of priority) {
    if (contexts.includes(tag)) return tag;
  }

  return 'generic';
}

function inferGeneric(definitionId: string, contexts: PersonalizationContextTag[]): boolean {
  const id = definitionId.toUpperCase();
  if (matchesAny(id, GENERIC_PATTERNS)) return true;
  if (contexts.length === 1 && contexts[0] === 'generic') return true;
  if (contexts.includes('unexpected') && !contexts.includes('work') && !contexts.includes('risky')) {
    return true;
  }
  return false;
}

function inferComplexityTier(definitionId: string): ComplexityTier {
  const id = definitionId.toUpperCase();
  if (matchesAny(id, DEMANDING_PATTERNS)) return 'demanding';
  if (matchesAny(id, MODERATE_PATTERNS)) return 'moderate';
  return 'everyday';
}

function inferReputationBias(definitionId: string, contexts: PersonalizationContextTag[]): MetricBias {
  const id = definitionId.toUpperCase();
  if (matchesAny(id, RISKY_PATTERNS) || matchesAny(id, ['SHADY', 'STEAL', 'RUDE', 'DISMISS', 'BLAME'])) {
    return 'low';
  }
  if (contexts.includes('social') || contexts.includes('work')) {
    if (matchesAny(id, ['CHARITY', 'HELP', 'COVER', 'CALM', 'POSITIVE'])) return 'high';
  }
  return 'neutral';
}

function inferSympathyBias(definitionId: string, contexts: PersonalizationContextTag[]): MetricBias {
  const id = definitionId.toUpperCase();
  if (contexts.includes('family') || matchesAny(id, ['CHARITY', 'ELDERLY', 'HELP', 'VISIT'])) {
    return 'high';
  }
  if (matchesAny(id, ['RUDE', 'DISMISS', 'STEAL', 'IGNORE', 'AVOID'])) {
    return 'low';
  }
  return 'neutral';
}

function inferRequiresUnlocked(contexts: PersonalizationContextTag[]): ProfileDimensionId[] {
  const required: ProfileDimensionId[] = [];
  if (contexts.includes('work')) required.push('work');
  if (contexts.includes('living')) required.push('living');
  if (contexts.includes('family')) required.push('personal');
  return required;
}

export function inferTaskPersonalizationMetadata(definitionId: string): TaskPersonalizationMetadata {
  const override = METADATA_OVERRIDES[definitionId];
  const contexts = override?.contexts ?? inferContexts(definitionId);
  const primaryContext = override?.primaryContext ?? inferPrimaryContext(contexts);

  return {
    definitionId,
    contexts,
    primaryContext,
    generic: override?.generic ?? inferGeneric(definitionId, contexts),
    complexityTier: override?.complexityTier ?? inferComplexityTier(definitionId),
    reputationBias: override?.reputationBias ?? inferReputationBias(definitionId, contexts),
    sympathyBias: override?.sympathyBias ?? inferSympathyBias(definitionId, contexts),
    requiresUnlocked: override?.requiresUnlocked ?? inferRequiresUnlocked(contexts),
  };
}

const metadataCache = new Map<string, TaskPersonalizationMetadata>();

export function getTaskPersonalizationMetadata(definitionId: string): TaskPersonalizationMetadata {
  const cached = metadataCache.get(definitionId);
  if (cached) return cached;

  const metadata = inferTaskPersonalizationMetadata(definitionId);
  metadataCache.set(definitionId, metadata);
  return metadata;
}

/** Pre-warm cache for pool entries — useful for tests and reporting. */
export function getAllTaskPersonalizationMetadata(): TaskPersonalizationMetadata[] {
  return ALL_POOL_ENTRY_DEFINITION_IDS.map((definitionId) =>
    getTaskPersonalizationMetadata(definitionId),
  );
}

export function summarizePersonalizationCoverage(): Record<PersonalizationContextTag, number> {
  const summary: Record<PersonalizationContextTag, number> = {
    work: 0,
    family: 0,
    living: 0,
    social: 0,
    economic: 0,
    unexpected: 0,
    risky: 0,
    dialogue: 0,
    generic: 0,
  };

  for (const metadata of getAllTaskPersonalizationMetadata()) {
    summary[metadata.primaryContext] += 1;
    if (metadata.generic) {
      summary.generic += 1;
    }
  }

  return summary;
}
