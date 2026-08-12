import { eq, and, gt } from 'drizzle-orm';
import type { Database } from '../client.js';
import { idempotencyKeys } from '../schema/index.js';
import type { IdempotencyRecord, IdempotencyRepository } from '../../../domain/ports/repositories.js';

export class DrizzleIdempotencyRepository implements IdempotencyRepository {
  constructor(private readonly db: Database) {}

  async find(key: string): Promise<IdempotencyRecord | null> {
    const rows = await this.db
      .select()
      .from(idempotencyKeys)
      .where(and(eq(idempotencyKeys.key, key), gt(idempotencyKeys.expiresAt, new Date())))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      key: row.key,
      commandType: row.commandType,
      responseBody: row.responseBody,
      statusCode: row.statusCode,
    };
  }

  async save(record: IdempotencyRecord, expiresAt: Date): Promise<void> {
    await this.db.insert(idempotencyKeys).values({
      key: record.key,
      commandType: record.commandType,
      responseBody: record.responseBody,
      statusCode: record.statusCode,
      expiresAt,
    });
  }
}
