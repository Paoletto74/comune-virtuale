import { randomUUID } from 'node:crypto';
import type { ActorContext } from '@comune-virtuale/shared';
import type { SessionRepository } from '../../domain/ports/repositories.js';
import { PENDING_CITIZEN_ID } from '../../slice/constants.js';
import { resolveSessionRoles } from '../../slice/admin-constants.js';

const SESSION_COOKIE = 'sid';

export { SESSION_COOKIE };

export class AuthService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly sessionTtlSeconds: number,
    private readonly adminAccountIds: Set<string>,
  ) {}

  async createDevSession(accountId: string, citizenId?: string): Promise<{ sessionId: string }> {
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + this.sessionTtlSeconds * 1000);
    await this.sessions.create({
      sessionId,
      accountId,
      citizenId: citizenId ?? PENDING_CITIZEN_ID,
      roles: resolveSessionRoles(accountId, this.adminAccountIds),
      expiresAt,
    });
    return { sessionId };
  }

  async updateSessionCitizen(sessionId: string, citizenId: string): Promise<void> {
    await this.sessions.updateCitizenId(sessionId, citizenId);
  }

  async resolveSession(sessionId: string | undefined): Promise<ActorContext | null> {
    if (!sessionId) return null;
    const record = await this.sessions.findById(sessionId);
    if (!record) return null;
    return {
      accountId: record.accountId,
      citizenId: record.citizenId,
      roles: record.roles as ActorContext['roles'],
      sessionId: record.sessionId,
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessions.revoke(sessionId);
  }
}
