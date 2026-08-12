import { and, eq } from 'drizzle-orm';
import type { Database } from '../client.js';
import { riskOutcomes } from '../schema/index.js';
import type {
  RiskOutcomeRecord,
  RiskOutcomeRepository,
  SaveRiskOutcomeInput,
} from '../../../domain/ports/repositories.js';

function mapOutcome(row: typeof riskOutcomes.$inferSelect): RiskOutcomeRecord {
  return {
    outcomeId: row.outcomeId,
    taskInstanceId: row.taskInstanceId,
    optionId: row.optionId,
    riskSpecRef: row.riskSpecRef,
    branchId: row.branchId,
    resolutionSeed: row.resolutionSeed,
    rollDigest: row.rollDigest,
    idempotencyKey: row.idempotencyKey,
    correlationId: row.correlationId,
    createdAt: row.createdAt,
  };
}

export class DrizzleRiskOutcomeRepository implements RiskOutcomeRepository {
  constructor(private readonly db: Database) {}

  async findByIdempotencyKey(idempotencyKey: string): Promise<RiskOutcomeRecord | null> {
    const rows = await this.db
      .select()
      .from(riskOutcomes)
      .where(eq(riskOutcomes.idempotencyKey, idempotencyKey))
      .limit(1);
    const row = rows[0];
    return row ? mapOutcome(row) : null;
  }

  async findByTaskInstanceAndOption(
    taskInstanceId: string,
    optionId: string,
  ): Promise<RiskOutcomeRecord | null> {
    const rows = await this.db
      .select()
      .from(riskOutcomes)
      .where(
        and(
          eq(riskOutcomes.taskInstanceId, taskInstanceId),
          eq(riskOutcomes.optionId, optionId),
        ),
      )
      .limit(1);
    const row = rows[0];
    return row ? mapOutcome(row) : null;
  }

  async save(input: SaveRiskOutcomeInput): Promise<RiskOutcomeRecord> {
    const existing = await this.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return existing;
    }

    const rows = await this.db
      .insert(riskOutcomes)
      .values({
        outcomeId: input.outcomeId,
        taskInstanceId: input.taskInstanceId,
        optionId: input.optionId,
        riskSpecRef: input.riskSpecRef,
        branchId: input.branchId,
        resolutionSeed: input.resolutionSeed,
        rollDigest: input.rollDigest,
        idempotencyKey: input.idempotencyKey,
        correlationId: input.correlationId,
      })
      .returning();

    return mapOutcome(rows[0]!);
  }
}
