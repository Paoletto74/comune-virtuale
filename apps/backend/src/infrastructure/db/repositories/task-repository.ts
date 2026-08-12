import { and, eq, inArray, sql, asc } from 'drizzle-orm';
import type { Database } from '../client.js';
import { citizens, taskInstances } from '../schema/index.js';
import type { TaskInstanceRecord, TaskRepository } from '../../../domain/ports/repositories.js';

function mapTask(row: typeof taskInstances.$inferSelect): TaskInstanceRecord {
  return {
    taskInstanceId: row.taskInstanceId,
    definitionId: row.definitionId,
    citizenId: row.citizenId,
    targetNpcId: row.targetNpcId,
    context: (row.context ?? {}) as Record<string, unknown>,
    status: row.status,
    selectedOptionId: row.selectedOptionId,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
  };
}

function selectionIdempotencyKeyCondition(idempotencyKey: string) {
  return sql`${taskInstances.context}->'selectionAudit'->>'idempotencyKey' = ${idempotencyKey}`;
}

export class DrizzleTaskRepository implements TaskRepository {
  constructor(private readonly db: Database) {}

  async findActiveByCitizenId(citizenId: string): Promise<TaskInstanceRecord[]> {
    const rows = await this.db
      .select()
      .from(taskInstances)
      .where(
        and(eq(taskInstances.citizenId, citizenId), inArray(taskInstances.status, ['pending', 'active'])),
      )
      .orderBy(asc(taskInstances.createdAt));
    return rows.map(mapTask);
  }

  async findAllByCitizenId(citizenId: string): Promise<TaskInstanceRecord[]> {
    const rows = await this.db
      .select()
      .from(taskInstances)
      .where(eq(taskInstances.citizenId, citizenId));
    return rows.map(mapTask);
  }

  async findById(taskInstanceId: string): Promise<TaskInstanceRecord | null> {
    const rows = await this.db
      .select()
      .from(taskInstances)
      .where(eq(taskInstances.taskInstanceId, taskInstanceId))
      .limit(1);
    const row = rows[0];
    return row ? mapTask(row) : null;
  }

  async findByCitizenAndDefinitionId(
    citizenId: string,
    definitionId: string,
  ): Promise<TaskInstanceRecord | null> {
    const rows = await this.db
      .select()
      .from(taskInstances)
      .where(
        and(eq(taskInstances.citizenId, citizenId), eq(taskInstances.definitionId, definitionId)),
      )
      .limit(1);
    const row = rows[0];
    return row ? mapTask(row) : null;
  }

  async findBySelectionIdempotencyKey(idempotencyKey: string): Promise<TaskInstanceRecord | null> {
    const rows = await this.db
      .select()
      .from(taskInstances)
      .where(selectionIdempotencyKeyCondition(idempotencyKey))
      .limit(1);
    const row = rows[0];
    return row ? mapTask(row) : null;
  }

  async createTaskInstance(input: {
    taskInstanceId: string;
    definitionId: string;
    citizenId: string;
    targetNpcId: string | null;
    context: Record<string, unknown>;
    status: string;
  }): Promise<TaskInstanceRecord> {
    const rows = await this.db
      .insert(taskInstances)
      .values({
        taskInstanceId: input.taskInstanceId,
        definitionId: input.definitionId,
        citizenId: input.citizenId,
        targetNpcId: input.targetNpcId,
        context: input.context,
        status: input.status,
      })
      .returning();

    return mapTask(rows[0]!);
  }

  async createTaskInstanceIdempotent(input: {
    citizenId: string;
    idempotencyKey: string;
    taskInstanceId: string;
    definitionId: string;
    targetNpcId: string | null;
    context: Record<string, unknown>;
    status: string;
  }): Promise<{ record: TaskInstanceRecord; created: boolean }> {
    return this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT ${citizens.citizenId} FROM ${citizens} WHERE ${citizens.citizenId} = ${input.citizenId} FOR UPDATE`,
      );

      const idempotentRows = await tx
        .select()
        .from(taskInstances)
        .where(selectionIdempotencyKeyCondition(input.idempotencyKey))
        .limit(1);
      const idempotentMatch = idempotentRows[0];
      if (idempotentMatch) {
        return { record: mapTask(idempotentMatch), created: false };
      }

      const duplicateRows = await tx
        .select()
        .from(taskInstances)
        .where(
          and(
            eq(taskInstances.citizenId, input.citizenId),
            eq(taskInstances.definitionId, input.definitionId),
          ),
        )
        .limit(1);
      const duplicateMatch = duplicateRows[0];
      if (duplicateMatch) {
        return { record: mapTask(duplicateMatch), created: false };
      }

      const rows = await tx
        .insert(taskInstances)
        .values({
          taskInstanceId: input.taskInstanceId,
          definitionId: input.definitionId,
          citizenId: input.citizenId,
          targetNpcId: input.targetNpcId,
          context: input.context,
          status: input.status,
        })
        .returning();

      return { record: mapTask(rows[0]!), created: true };
    });
  }

  async completeTask(input: {
    taskInstanceId: string;
    citizenId: string;
    optionId: string;
    completedAt: Date;
  }): Promise<TaskInstanceRecord> {
    const rows = await this.db
      .update(taskInstances)
      .set({
        status: 'completed',
        selectedOptionId: input.optionId,
        completedAt: input.completedAt,
      })
      .where(
        and(
          eq(taskInstances.taskInstanceId, input.taskInstanceId),
          eq(taskInstances.citizenId, input.citizenId),
        ),
      )
      .returning();

    const row = rows[0];
    if (!row) {
      throw new Error('Task instance not found for completion');
    }
    return mapTask(row);
  }

  async updateTaskInstance(input: {
    taskInstanceId: string;
    citizenId: string;
    status: string;
    context: Record<string, unknown>;
  }): Promise<TaskInstanceRecord> {
    const rows = await this.db
      .update(taskInstances)
      .set({
        status: input.status,
        context: input.context,
      })
      .where(
        and(
          eq(taskInstances.taskInstanceId, input.taskInstanceId),
          eq(taskInstances.citizenId, input.citizenId),
        ),
      )
      .returning();

    const row = rows[0];
    if (!row) {
      throw new Error('Task instance not found for update');
    }
    return mapTask(row);
  }

  async cancelPendingTasks(
    citizenId: string,
    taskInstanceIds: readonly string[],
  ): Promise<number> {
    if (taskInstanceIds.length === 0) {
      return 0;
    }

    const rows = await this.db
      .update(taskInstances)
      .set({ status: 'cancelled' })
      .where(
        and(
          eq(taskInstances.citizenId, citizenId),
          eq(taskInstances.status, 'pending'),
          inArray(taskInstances.taskInstanceId, [...taskInstanceIds]),
        ),
      )
      .returning();

    return rows.length;
  }
}
