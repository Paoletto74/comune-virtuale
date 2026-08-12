import { computeResolutionSeed } from './deterministic-roll.js';
import type { RiskSpecRegistry } from './risk-spec-registry.js';
import { defaultRiskSpecRegistry } from './risk-spec-registry.js';
import type { FrozenOptionRiskSpec, ResolvedRiskContext, RiskSpecResolveInput } from './risk-types.js';

export class RiskSpecResolver {
  constructor(private readonly registry: RiskSpecRegistry = defaultRiskSpecRegistry) {}

  resolveSpecsForTask(input: RiskSpecResolveInput): ResolvedRiskContext | null {
    const registered = this.registry.getSpecsForDefinition(input.definitionId);
    if (registered.length === 0) {
      return null;
    }

    const byOptionId: Record<string, FrozenOptionRiskSpec> = {};
    const frozenAt = new Date().toISOString();

    for (const { optionId, spec } of registered) {
      byOptionId[optionId] = {
        riskSpecRef: spec.riskSpecRef,
        exposureLevel: spec.exposureLevel,
        branches: spec.branches.map((branch) => ({
          branchId: branch.branchId,
          weight: branch.weight.toString(),
        })),
        resolutionSeed: computeResolutionSeed(
          input.taskInstanceId,
          optionId,
          spec.riskSpecRef,
          spec.resolutionVersion,
        ),
        resolutionVersion: spec.resolutionVersion,
        frozenAt,
      };
    }

    return {
      resolutionVersion: 1,
      byOptionId,
    };
  }
}

export const defaultRiskSpecResolver = new RiskSpecResolver();
