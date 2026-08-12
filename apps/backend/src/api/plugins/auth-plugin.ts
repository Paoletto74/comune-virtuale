import type { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { AppError } from './error-handler-plugin.js';
import type { AuthService } from '../../application/auth/auth-service.js';
import { SESSION_COOKIE } from '../../application/auth/auth-service.js';
import type { ActorContext } from '@comune-virtuale/shared';
import { isPendingCitizen } from '../../slice/constants.js';

declare module 'fastify' {
  interface FastifyRequest {
    actor: ActorContext | null;
  }
}

export function createAuthPlugin(authService: AuthService) {
  return fp(
    async function authPlugin(app: FastifyInstance) {
      app.decorateRequest('actor', null);

      app.addHook('onRequest', async (request) => {
        const sessionId = request.cookies[SESSION_COOKIE];
        request.actor = await authService.resolveSession(sessionId);
      });
    },
    { name: 'auth-plugin' },
  );
}

export function requireAuth(request: FastifyRequest): ActorContext {
  if (!request.actor) {
    throw new AppError('AUTH', 'AUTH_REQUIRED', 'error.auth.required');
  }
  return request.actor;
}

export function requireCitizen(request: FastifyRequest): ActorContext {
  const actor = requireAuth(request);
  if (isPendingCitizen(actor.citizenId)) {
    throw new AppError('BUSINESS', 'CITIZEN_REQUIRED', 'error.citizen.required');
  }
  return actor;
}

export function requireAdmin(request: FastifyRequest): ActorContext {
  const actor = requireCitizen(request);
  if (!actor.roles.includes('ADMIN')) {
    throw new AppError('PERMISSION', 'ADMIN_REQUIRED', 'error.auth.admin_required');
  }
  return actor;
}
