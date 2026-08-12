import type { OptionRiskSpecDefinition } from './risk-types.js';
import { DEMO_STEAL_WALLET_RISK_REGISTRATION } from '../../slice/risk-constants.js';
import { DEMO_BOSS_NEGATIVE_END_RISK_REGISTRATION } from '../../slice/boss-risk-constants.js';
import { ALL_THEFT_RISK_REGISTRATIONS } from '../../slice/theft-risk-constants.js';

function registryKey(definitionId: string, optionId: string): string {
  return `${definitionId}:${optionId}`;
}

export class RiskSpecRegistry {
  private readonly specs = new Map<string, OptionRiskSpecDefinition>();

  register(definitionId: string, optionId: string, spec: OptionRiskSpecDefinition): void {
    this.specs.set(registryKey(definitionId, optionId), spec);
  }

  get(definitionId: string, optionId: string): OptionRiskSpecDefinition | null {
    return this.specs.get(registryKey(definitionId, optionId)) ?? null;
  }

  getSpecsForDefinition(definitionId: string): Array<{ optionId: string; spec: OptionRiskSpecDefinition }> {
    const prefix = `${definitionId}:`;
    const entries: Array<{ optionId: string; spec: OptionRiskSpecDefinition }> = [];

    for (const [key, spec] of this.specs.entries()) {
      if (key.startsWith(prefix)) {
        entries.push({ optionId: key.slice(prefix.length), spec });
      }
    }

    return entries;
  }
}

export const defaultRiskSpecRegistry = new RiskSpecRegistry();

function registerRiskSpec(registration: {
  definitionId: string;
  optionId: string;
  spec: OptionRiskSpecDefinition;
}): void {
  defaultRiskSpecRegistry.register(
    registration.definitionId,
    registration.optionId,
    registration.spec,
  );
}

registerRiskSpec(DEMO_STEAL_WALLET_RISK_REGISTRATION);
registerRiskSpec(DEMO_BOSS_NEGATIVE_END_RISK_REGISTRATION);
for (const registration of ALL_THEFT_RISK_REGISTRATIONS) {
  registerRiskSpec(registration);
}
