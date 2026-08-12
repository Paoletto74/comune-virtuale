import { randomUUID } from 'node:crypto';
import type { RiskOutcomeRepository } from '../../domain/ports/repositories.js';
import type { ConsequenceApplier } from './consequence-applicator.js';
import { defaultConsequenceApplicator } from './consequence-applicator.js';
import { deterministicBranchRoll } from './deterministic-roll.js';
import { riskOutcomeIdempotencyKey } from './risk-constants.js';
import type { RiskEffectsApplied, RiskEvaluateInput, RiskOutcomeDto, RiskExposureLevel } from './risk-types.js';

export class RiskService {
  constructor(
    private readonly outcomes: RiskOutcomeRepository,
    private readonly consequenceApplier: ConsequenceApplier = defaultConsequenceApplicator,
  ) {}

  async evaluate(input: RiskEvaluateInput): Promise<RiskOutcomeDto | null> {
    const frozen = input.resolvedRisk?.byOptionId?.[input.optionId];
    if (!frozen) {
      return null;
    }

    const idempotencyKey = riskOutcomeIdempotencyKey(input.taskInstanceId, input.optionId);
    const existing = await this.outcomes.findByIdempotencyKey(idempotencyKey);
    if (existing) {
      const consequence = await this.consequenceApplier.apply({
        outcomeId: existing.outcomeId,
        taskInstanceId: input.taskInstanceId,
        optionId: input.optionId,
        riskSpecRef: existing.riskSpecRef,
        branchId: existing.branchId,
        citizenId: input.citizenId,
        correlationId: input.correlationId,
      });
      return this.toDto(existing, frozen.exposureLevel, consequence, true);
    }

    const roll = deterministicBranchRoll(frozen.resolutionSeed, frozen.branches);
    const outcomeId = randomUUID();

    const record = await this.outcomes.save({
      outcomeId,
      taskInstanceId: input.taskInstanceId,
      optionId: input.optionId,
      riskSpecRef: frozen.riskSpecRef,
      branchId: roll.branchId,
      resolutionSeed: frozen.resolutionSeed,
      rollDigest: roll.rollDigest,
      idempotencyKey,
      correlationId: input.correlationId ?? null,
    });

    const consequence = await this.consequenceApplier.apply({
      outcomeId: record.outcomeId,
      taskInstanceId: input.taskInstanceId,
      optionId: input.optionId,
      riskSpecRef: frozen.riskSpecRef,
      branchId: roll.branchId,
      citizenId: input.citizenId,
      correlationId: input.correlationId,
    });

    return this.toDto(record, frozen.exposureLevel, consequence, false);
  }

  toEffectsApplied(outcome: RiskOutcomeDto | null): RiskEffectsApplied | undefined {
    if (!outcome) {
      return undefined;
    }

    return {
      exposureLevel: outcome.exposureLevel,
      outcome: {
        branchId: outcome.branchId,
        visibility: outcome.visibility ?? 'visible',
        ...(outcome.messageKey ? { messageKey: outcome.messageKey } : {}),
      },
    };
  }

  private toDto(
    record: {
      outcomeId: string;
      taskInstanceId: string;
      optionId: string;
      riskSpecRef: string;
      branchId: string;
      resolutionSeed: string;
      rollDigest: string;
    },
    exposureLevel: RiskExposureLevel | undefined,
    consequence: { messageKey?: string; visibility?: 'visible' | 'hidden' },
    duplicate: boolean,
  ): RiskOutcomeDto {
    return {
      outcomeId: record.outcomeId,
      taskInstanceId: record.taskInstanceId,
      optionId: record.optionId,
      riskSpecRef: record.riskSpecRef,
      branchId: record.branchId,
      resolutionSeed: record.resolutionSeed,
      rollDigest: record.rollDigest,
      exposureLevel,
      messageKey: consequence.messageKey,
      visibility: consequence.visibility,
      duplicate,
    };
  }
}
