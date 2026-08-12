import { eq, and, isNull, gt } from 'drizzle-orm';
import type { Database } from '../client.js';
import { sessions } from '../schema/index.js';
import type { SessionRecord, SessionRepository } from '../../../domain/ports/repositories.js';

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private readonly db: Database) {}

  async create(record: Omit<SessionRecord, 'revokedAt'>): Promise<SessionRecord> {
    await this.db.insert(sessions).values({
      sessionId: record.sessionId,
      accountId: record.accountId,
      citizenId: record.citizenId,
      roles: record.roles,
      expiresAt: record.expiresAt,
    });
    return { ...record, revokedAt: null };
  }

  async findById(sessionId: string): Promise<SessionRecord | null> {
    const rows = await this.db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.sessionId, sessionId),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      sessionId: row.sessionId,
      accountId: row.accountId,
      citizenId: row.citizenId,
      roles: row.roles as string[],
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
    };
  }

  async revoke(sessionId: string): Promise<void> {
    await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.sessionId, sessionId));
  }

  async updateCitizenId(sessionId: string, citizenId: string): Promise<void> {
    await this.db.update(sessions).set({ citizenId }).where(eq(sessions.sessionId, sessionId));
  }
}
