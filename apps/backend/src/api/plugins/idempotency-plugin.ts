import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { IDEMPOTENCY_HEADER } from '@comune-virtuale/shared';
import { parseIdempotencyKey } from '@comune-virtuale/shared/correlation';
import type { IdempotencyRepository } from '../../domain/ports/repositories.js';
import { AppError } from './error-handler-plugin.js';

export function createIdempotencyPlugin(
  repo: IdempotencyRepository,
  ttlSeconds: number,
) {
  return fp(
    async function idempotencyPlugin(app: FastifyInstance) {
      app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
        if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
          return;
        }

        // Auth and admin routes excluded from idempotency
        if (request.url.startsWith('/api/v1/auth/') || request.url.startsWith('/api/v1/admin/')) {
          return;
        }

        const rawKey = request.headers[IDEMPOTENCY_HEADER] as string | undefined;
        const key = parseIdempotencyKey(rawKey);
        if (!key) {
          throw new AppError('VALIDATION', 'IDEMPOTENCY_KEY_REQUIRED', 'error.validation.idempotency_key');
        }

        const existing = await repo.find(key);
        if (existing) {
          reply.status(existing.statusCode);
          return reply.send(existing.responseBody);
        }

        // Store key on request for post-handler persistence
        request.idempotencyKey = key;
        request.idempotencyCommandType = `${request.method}:${request.url}`;
      });

      app.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
        if (!request.idempotencyKey || reply.statusCode >= 500) {
          return payload;
        }

        let body: unknown;
        try {
          body = typeof payload === 'string' ? JSON.parse(payload) : payload;
        } catch {
          body = payload;
        }

        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
        await repo.save(
          {
            key: request.idempotencyKey,
            commandType: request.idempotencyCommandType ?? 'unknown',
            responseBody: body,
            statusCode: reply.statusCode,
          },
          expiresAt,
        );

        return payload;
      });
    },
    { name: 'idempotency-plugin' },
  );
}

declare module 'fastify' {
  interface FastifyRequest {
    idempotencyKey?: string;
    idempotencyCommandType?: string;
  }
}
