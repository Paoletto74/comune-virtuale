import type { Database } from '../client.js';
import { auditLog } from '../schema/index.js';
import type { AuditEntry, AuditLogRepository } from '../../../domain/ports/repositories.js';

export class DrizzleAuditLogRepository implements AuditLogRepository {
  constructor(private readonly db: Database) {}

  async append(entry: AuditEntry): Promise<void> {
    await this.db.insert(auditLog).values({
      correlationId: entry.correlationId,
      actorId: entry.actorId ?? null,
      action: entry.action,
      targetId: entry.targetId ?? null,
      payload: entry.payload ?? null,
      worldTimeMs: entry.worldTimeMs ?? null,
    });
  }
}
