import type { FastifyInstance } from 'fastify';
import type { FlashOpportunityService } from '../../application/flash/flash-opportunity-service.js';
import { requireAdmin } from '../plugins/auth-plugin.js';
import {
  getFlashOpportunityConfig,
  setFlashOpportunityConfig,
  resetFlashOpportunityConfig,
  type FlashOpportunityConfig,
} from '../../slice/flash-opportunities-constants.js';

export interface AdminFlashRouteDeps {
  flashOpportunities: FlashOpportunityService;
  enableDevAuth: boolean;
}

export async function registerAdminFlashRoutes(app: FastifyInstance, deps: AdminFlashRouteDeps) {
  if (!deps.enableDevAuth) return;

  app.get('/api/v1/admin/flash/config', async (request) => {
    requireAdmin(request);
    return getFlashOpportunityConfig();
  });

  app.post(
    '/api/v1/admin/flash/config',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          properties: {
            enabled: { type: 'boolean' },
            minDecisionDurationMs: { type: 'integer', minimum: 1000, maximum: 120_000 },
            maxDecisionDurationMs: { type: 'integer', minimum: 1000, maximum: 120_000 },
            minAnticipationDurationMs: { type: 'integer', minimum: 1000, maximum: 3_600_000 },
            maxAnticipationDurationMs: { type: 'integer', minimum: 1000, maximum: 3_600_000 },
            minSpawnIntervalMs: { type: 'integer', minimum: 0, maximum: 3_600_000 },
            maxSpawnIntervalMs: { type: 'integer', minimum: 0, maximum: 3_600_000 },
            opportunityChance: { type: 'number', minimum: 0, maximum: 1 },
            maxActive: { type: 'integer', minimum: 1, maximum: 1 },
          },
        },
      },
    },
    async (request) => {
      requireAdmin(request);
      const body = request.body as Partial<FlashOpportunityConfig>;
      return setFlashOpportunityConfig(body);
    },
  );

  app.post('/api/v1/admin/flash/config/reset', async (request) => {
    requireAdmin(request);
    resetFlashOpportunityConfig();
    return getFlashOpportunityConfig();
  });

  app.post(
    '/api/v1/admin/flash/evaluate',
    {
      schema: {
        body: {
          type: 'object',
          required: ['citizenId', 'nowMs'],
          properties: {
            citizenId: { type: 'string', minLength: 1 },
            nowMs: { type: 'integer', minimum: 0 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      requireAdmin(request);
      const body = request.body as { citizenId: string; nowMs: number };
      return deps.flashOpportunities.evaluateForDev({
        citizenId: body.citizenId,
        nowMs: body.nowMs,
      });
    },
  );
}
