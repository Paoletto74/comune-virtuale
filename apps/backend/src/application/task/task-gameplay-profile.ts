import { defaultEffectRegistry } from '../effects/effect-registry.js';
import type { EffectBundle, EffectResolutionInput } from '../effects/effect-types.js';
import { defaultRiskSpecRegistry } from '../risk/risk-spec-registry.js';
import { defaultTaskDefinitionCatalog } from './task-definition-catalog.js';
import { ALL_POOL_ENTRY_DEFINITION_IDS } from './task-pool-registry.js';
import { getDialogueNext, isDialogueRootDefinition, isDialogueTerminal } from '../../slice/dialogue-routing.js';
import { DEMO_BOSS_DIALOGUE_TERMINAL_OPTION } from '../../slice/boss-dialogue-constants.js';
import { SLICE_DEMO_TASK_DEFINITION_ID, SLICE_DEMO_TASK_OPTION_STEAL_WALLET } from '../../slice/constants.js';
import { PERSONAL_VALUE_KEYS, type PersonalValueKey } from '../../slice/personal-values-constants.js';
import '../task/register-slice-task-definitions.js';

export type GameplayHintTag =
  | 'normal'
  | 'positive'
  | 'economic'
  | 'high_gain'
  | 'urgent'
  | 'risky'
  | 'ambiguous';

export interface TaskGameplayHints {
  tags: GameplayHintTag[];
  maxGainMinor?: string;
}

export interface TaskGameplayProfile extends TaskGameplayHints {
  definitionId: string;
}

const PROFILE_RESOLVE_CONTEXT = {
  taskInstanceId: 'gameplay-profile',
  citizenId: 'gameplay-profile',
};

const HIGH_GAIN_THRESHOLD_MINOR = 10n;
const ECONOMIC_GAIN_THRESHOLD_MINOR = 5n;

const URGENCY_TEXT_PATTERNS = [
  'scadenza',
  'urgente',
  'subito',
  'ritardo',
  'coincidono',
  'multa',
  'in ritardo',
  'aspetta',
  'scade',
  'immediat',
  'entro stasera',
  'domani mattina',
  'tempo stringe',
  'in scadenza',
] as const;

const URGENCY_ID_PATTERNS = [
  'DEADLINE',
  'SUPPLIER_DELAY',
  'MEETING_CONFLICT',
  'BILL_SHOCK',
  'BILL_',
  'PARKING',
  'SUPPLIER',
] as const;

const CRIMINAL_ID_PATTERNS = [
  'STEAL',
  'SHADY',
  'RISKY',
  'SCAM',
  'SUITCASE',
  'BRIBE',
  'SHADY_DEAL',
] as const;

function isCriminalDefinition(definitionId: string): boolean {
  return CRIMINAL_ID_PATTERNS.some((pattern) => definitionId.toUpperCase().includes(pattern));
}

function resolveOptionEffect(input: EffectResolutionInput): EffectBundle | null {
  try {
    return defaultEffectRegistry.resolve(input);
  } catch {
    return null;
  }
}

function economicDelta(bundle: EffectBundle): bigint {
  if (bundle.economic.kind === 'cash_delta') {
    return bundle.economic.deltaMinor;
  }
  if (bundle.economic.kind === 'transfer') {
    return bundle.economic.amountMinor;
  }
  return 0n;
}

function stealWalletContext() {
  return {
    resolvedEffects: {
      stealWallet: {
        effectSetRef: 'DEMO_STEAL_WALLET_IMMEDIATE' as const,
        from: { ownerType: 'npc' as const, ownerRef: 'npc-profile' },
        to: { ownerType: 'citizen' as const, ownerRef: 'gameplay-profile' },
        requestedAmountMinor: '10',
        walletAtSpawnMinor: '20',
        resolutionVersion: 1 as const,
      },
    },
  };
}

function optionContext(definitionId: string, optionId: string) {
  if (
    definitionId === SLICE_DEMO_TASK_DEFINITION_ID &&
    optionId === SLICE_DEMO_TASK_OPTION_STEAL_WALLET
  ) {
    return stealWalletContext();
  }
  return {};
}

function collectDialogueTerminalIds(rootDefinitionId: string): string[] {
  const terminals: string[] = [];
  const visited = new Set<string>();
  const queue = [rootDefinitionId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    if (isDialogueTerminal(current)) {
      terminals.push(current);
      continue;
    }

    const definition = defaultTaskDefinitionCatalog.get(current);
    if (!definition) continue;

    for (const option of definition.options) {
      const next = getDialogueNext(current, option.optionId);
      if (next) queue.push(next);
    }
  }

  return terminals;
}

function optionIdsForProfile(definitionId: string): Array<{ optionId: string; definitionId: string }> {
  if (isDialogueRootDefinition(definitionId)) {
    return collectDialogueTerminalIds(definitionId).map((terminalId) => ({
      definitionId: terminalId,
      optionId: DEMO_BOSS_DIALOGUE_TERMINAL_OPTION,
    }));
  }

  const definition = defaultTaskDefinitionCatalog.get(definitionId);
  if (!definition) return [];

  return definition.options.map((option) => ({
    definitionId,
    optionId: option.optionId,
  }));
}

function hasNarrativeUrgency(definitionId: string, title: string, description: string): boolean {
  const id = definitionId.toUpperCase();
  if (URGENCY_ID_PATTERNS.some((pattern) => id.includes(pattern))) {
    return true;
  }

  const text = `${title} ${description}`.toLowerCase();
  return URGENCY_TEXT_PATTERNS.some((pattern) => text.includes(pattern));
}

function buildProfile(definitionId: string): TaskGameplayProfile {
  const definition = defaultTaskDefinitionCatalog.get(definitionId);
  const title = definition?.title ?? definitionId;
  const description = definition?.description ?? '';

  let maxGainMinor = 0n;
  let minGainMinor = 0n;
  let maxReputation = 0;
  let minReputation = 0;
  let maxSympathy = 0;
  let minSympathy = 0;
  let hasRiskOption = defaultRiskSpecRegistry.getSpecsForDefinition(definitionId).length > 0;
  let hasPersonalEffect = false;

  for (const target of optionIdsForProfile(definitionId)) {
    if (defaultRiskSpecRegistry.get(target.definitionId, target.optionId)) {
      hasRiskOption = true;
    }

    const bundle = resolveOptionEffect({
      definitionId: target.definitionId,
      optionId: target.optionId,
      ...PROFILE_RESOLVE_CONTEXT,
      context: optionContext(target.definitionId, target.optionId),
    });
    if (!bundle) continue;

    const cashDelta = economicDelta(bundle);
    if (cashDelta > maxGainMinor) maxGainMinor = cashDelta;
    if (cashDelta < minGainMinor) minGainMinor = cashDelta;

    const sympathy = bundle.personalValues.sympathy ?? 0;
    const reputation = bundle.personalValues.reputation ?? 0;
    maxSympathy = Math.max(maxSympathy, sympathy);
    minSympathy = Math.min(minSympathy, sympathy);
    maxReputation = Math.max(maxReputation, reputation);
    minReputation = Math.min(minReputation, reputation);

    if (sympathy !== 0 || reputation !== 0 || cashDelta !== 0n) {
      hasPersonalEffect = true;
    }
  }

  const tags = new Set<GameplayHintTag>();

  if (
    hasRiskOption ||
    isCriminalDefinition(definitionId) ||
    minReputation <= -2 ||
    (maxGainMinor > 0n && minReputation <= -1 && maxReputation <= 0)
  ) {
    tags.add('risky');
  }

  if (maxGainMinor >= HIGH_GAIN_THRESHOLD_MINOR) {
    tags.add('high_gain');
    tags.add('economic');
  } else if (maxGainMinor >= ECONOMIC_GAIN_THRESHOLD_MINOR) {
    tags.add('economic');
  }

  if (maxSympathy >= 1 || maxReputation >= 1) {
    if (minSympathy >= 0 && minReputation >= 0) {
      tags.add('positive');
    }
  }

  if (hasNarrativeUrgency(definitionId, title, description)) {
    tags.add('urgent');
  }

  const reputationSpread = maxReputation - minReputation;
  const sympathySpread = maxSympathy - minSympathy;
  const cashSpread = maxGainMinor - minGainMinor;
  if (
    hasPersonalEffect &&
    reputationSpread >= 2 &&
    minReputation < 0 &&
    maxReputation > 0
  ) {
    tags.add('ambiguous');
  } else if (sympathySpread >= 2 && minSympathy < 0 && maxSympathy > 0) {
    tags.add('ambiguous');
  } else if (maxGainMinor > 0n && minGainMinor < 0n && cashSpread >= 10n) {
    tags.add('ambiguous');
  }

  if (tags.size === 0) {
    tags.add('normal');
  }

  return {
    definitionId,
    tags: [...tags],
    ...(maxGainMinor > 0n ? { maxGainMinor: maxGainMinor.toString() } : {}),
  };
}

const PROFILE_BY_DEFINITION_ID = new Map<string, TaskGameplayProfile>(
  ALL_POOL_ENTRY_DEFINITION_IDS.map((definitionId) => [definitionId, buildProfile(definitionId)]),
);

export function getTaskGameplayProfile(definitionId: string): TaskGameplayProfile | null {
  return PROFILE_BY_DEFINITION_ID.get(definitionId) ?? null;
}

export function getTaskGameplayHints(definitionId: string): TaskGameplayHints | null {
  const profile = getTaskGameplayProfile(definitionId);
  if (!profile) return null;
  return {
    tags: profile.tags,
    ...(profile.maxGainMinor ? { maxGainMinor: profile.maxGainMinor } : {}),
  };
}

export function getAllTaskGameplayProfiles(): TaskGameplayProfile[] {
  return ALL_POOL_ENTRY_DEFINITION_IDS.map(
    (definitionId) => PROFILE_BY_DEFINITION_ID.get(definitionId)!,
  );
}

export function summarizeGameplayProfiles(): Record<GameplayHintTag, number> {
  const summary: Record<GameplayHintTag, number> = {
    normal: 0,
    positive: 0,
    economic: 0,
    high_gain: 0,
    urgent: 0,
    risky: 0,
    ambiguous: 0,
  };

  for (const profile of getAllTaskGameplayProfiles()) {
    for (const tag of profile.tags) {
      summary[tag] += 1;
    }
  }

  return summary;
}

export type TaskOptionStatEffects = Partial<Record<PersonalValueKey, number>> & {
  cashMinor?: string;
};

export function getTaskOptionStatEffects(
  definitionId: string,
  optionId: string,
): TaskOptionStatEffects | null {
  const bundle = resolveOptionEffect({
    definitionId,
    optionId,
    taskInstanceId: 'stat-preview',
    citizenId: 'stat-preview',
    context: optionContext(definitionId, optionId),
  });
  if (!bundle) return null;

  const effects: TaskOptionStatEffects = {};
  for (const key of PERSONAL_VALUE_KEYS) {
    const value = bundle.personalValues[key];
    if (value != null && value !== 0) {
      effects[key] = value;
    }
  }
  const cash = economicDelta(bundle);
  if (cash !== 0n) effects.cashMinor = cash.toString();
  return Object.keys(effects).length > 0 ? effects : null;
}
