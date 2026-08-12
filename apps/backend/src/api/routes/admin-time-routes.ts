import type { FastifyInstance } from 'fastify';
import { AppError } from '../plugins/error-handler-plugin.js';
import type { WorldClockService } from '../../domain/time/world-clock-service.js';
import { requireAdmin } from '../plugins/auth-plugin.js';
import {
  ADMIN_TIME_SCALE_MAX,
  ADMIN_TIME_SCALE_MIN,
} from '../../slice/time-life-constants.js';

export interface AdminTimeRouteDeps {
  worldClock: WorldClockService;
  enableDevAuth: boolean;
}

export async function registerAdminTimeRoutes(app: FastifyInstance, deps: AdminTimeRouteDeps) {
  if (!deps.enableDevAuth) return;

  app.get('/api/v1/admin/time', async (request) => {
    requireAdmin(request);
    return deps.worldClock.getAdminState();
  });

  app.post(
    '/api/v1/admin/time/scale',
    {
      schema: {
        body: {
          type: 'object',
          required: ['timeScale'],
          properties: {
            timeScale: { type: 'number', minimum: ADMIN_TIME_SCALE_MIN, maximum: ADMIN_TIME_SCALE_MAX },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      requireAdmin(request);
      const body = request.body as { timeScale: number };
      if (body.timeScale < ADMIN_TIME_SCALE_MIN || body.timeScale > ADMIN_TIME_SCALE_MAX) {
        throw new AppError('VALIDATION', 'INVALID_TIME_SCALE', 'error.time.invalid_scale');
      }
      return deps.worldClock.setTimeScale(body.timeScale);
    },
  );

  app.post(
    '/api/v1/admin/time/pause',
    {
      schema: {
        body: {
          type: 'object',
          required: ['paused'],
          properties: {
            paused: { type: 'boolean' },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      requireAdmin(request);
      const body = request.body as { paused: boolean };
      return deps.worldClock.setPaused(body.paused);
    },
  );

  app.post(
    '/api/v1/admin/time/advance',
    {
      schema: {
        body: {
          type: 'object',
          required: ['deltaMs'],
          properties: {
            deltaMs: { type: 'integer', minimum: 1, maximum: 7 * 24 * 60 * 60 * 1000 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      requireAdmin(request);
      const body = request.body as { deltaMs: number };
      return deps.worldClock.advanceGameTime(body.deltaMs);
    },
  );
}
