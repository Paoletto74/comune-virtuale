import type { FastifyInstance } from 'fastify';
import { requireAdmin } from '../plugins/auth-plugin.js';
import { getCorrelationId } from '../plugins/correlation-plugin.js';
import type { AdminContextService } from '../../application/admin/admin-context-service.js';

export interface AdminContextRouteDeps {
  adminContext: AdminContextService;
}

export async function registerAdminContextRoutes(
  app: FastifyInstance,
  deps: AdminContextRouteDeps,
): Promise<void> {
  app.get('/api/v1/admin/npc-portraits/pool', async (request) => {
    requireAdmin(request);
    const pool = await deps.adminContext.listNpcPortraitPool();
    return { ...pool, correlationId: getCorrelationId(request) };
  });

  app.get('/api/v1/admin/npcs', async (request) => {
    requireAdmin(request);
    const result = await deps.adminContext.listNpcs();
    return { ...result, correlationId: getCorrelationId(request) };
  });

  app.patch(
    '/api/v1/admin/npcs/:templateId/portrait',
    {
      schema: {
        params: {
          type: 'object',
          required: ['templateId'],
          properties: { templateId: { type: 'string', minLength: 1 } },
        },
        body: {
          type: 'object',
          required: ['portraitId'],
          properties: { portraitId: { type: 'string', minLength: 7, maxLength: 7 } },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      const actor = requireAdmin(request);
      const params = request.params as { templateId: string };
      const body = request.body as { portraitId: string };
      const npc = await deps.adminContext.setNpcPortrait({
        templateId: params.templateId,
        portraitId: body.portraitId,
        updatedByAccountId: actor.accountId,
      });
      return { npc, correlationId: getCorrelationId(request) };
    },
  );

  app.get('/api/v1/admin/players', async (request) => {
    requireAdmin(request);
    const result = await deps.adminContext.listPlayerCitizens();
    return { ...result, correlationId: getCorrelationId(request) };
  });

  app.get('/api/v1/admin/citizens/:citizenId', async (request) => {
    requireAdmin(request);
    const params = request.params as { citizenId: string };
    const citizen = await deps.adminContext.getEditableCitizen(params.citizenId);
    return { citizen, correlationId: getCorrelationId(request) };
  });

  app.patch(
    '/api/v1/admin/citizens/:citizenId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['citizenId'],
          properties: { citizenId: { type: 'string', minLength: 1 } },
        },
        body: {
          type: 'object',
          properties: {
            displayName: { type: 'string', minLength: 2, maxLength: 64 },
            portraitId: { type: 'string', minLength: 10, maxLength: 12 },
            mainLevel: { type: 'integer', minimum: 1, maximum: 20 },
            sympathy: { type: 'integer', minimum: 0, maximum: 100 },
            reputation: { type: 'integer', minimum: 0, maximum: 100 },
            happiness: { type: 'integer', minimum: 0, maximum: 100 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      requireAdmin(request);
      const params = request.params as { citizenId: string };
      const body = request.body as {
        displayName?: string;
        portraitId?: string;
        mainLevel?: number;
        sympathy?: number;
        reputation?: number;
        happiness?: number;
      };
      const citizen = await deps.adminContext.patchCitizen({
        citizenId: params.citizenId,
        patch: body,
      });
      return { citizen, correlationId: getCorrelationId(request) };
    },
  );
}
