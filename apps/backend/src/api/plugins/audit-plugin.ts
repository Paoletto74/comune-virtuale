import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuditLogRepository } from '../../domain/ports/repositories.js';
import type { WorldClockService } from '../../domain/time/world-clock-service.js';
import { getCorrelationId } from './correlation-plugin.js';

export function createAuditPlugin(auditRepo: AuditLogRepository, worldClock: WorldClockService) {
  return async function auditPlugin(app: FastifyInstance) {
    app.addHook('onResponse', async (request: FastifyRequest, reply) => {
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        return;
      }
      if (reply.statusCode >= 500) {
        return;
      }

      let worldTimeMs: bigint | undefined;
      try {
        const snapshot = await worldClock.now();
        worldTimeMs = BigInt(snapshot.worldTimeMs);
      } catch {
        // audit still proceeds without world time if clock unavailable
      }

      await auditRepo.append({
        correlationId: getCorrelationId(request),
        actorId: request.actor?.accountId,
        action: `${request.method} ${request.url}`,
        payload: {
          statusCode: reply.statusCode,
        },
        worldTimeMs,
      });
    });
  };
}
