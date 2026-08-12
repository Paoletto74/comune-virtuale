import type { FastifyInstance } from 'fastify';
import type { CitizenService } from '../../application/citizen/citizen-service.js';
import type { HomeService } from '../../application/home/home-service.js';
import type { TaskService } from '../../application/task/task-service.js';
import type { WorldClockService } from '../../domain/time/world-clock-service.js';
import type { FlashOpportunityService } from '../../application/flash/flash-opportunity-service.js';
import type { WorldEventService } from '../../application/world/world-event-service.js';
import { requireAuth, requireCitizen } from '../plugins/auth-plugin.js';
import { AppError } from '../plugins/error-handler-plugin.js';
import { getCorrelationId } from '../plugins/correlation-plugin.js';
import { isPendingCitizen } from '../../slice/constants.js';
import type { CitizenRepository } from '../../domain/ports/repositories.js';
import type { CitizenCareerService } from '../../application/citizen/citizen-career-service.js';

export interface SliceRouteDeps {
  worldClock: WorldClockService;
  citizenService: CitizenService;
  taskService: TaskService;
  homeService: HomeService;
  citizens: CitizenRepository;
  careerService?: CitizenCareerService;
  flashOpportunities?: FlashOpportunityService;
  worldEvents?: WorldEventService;
}

export async function registerSliceRoutes(app: FastifyInstance, deps: SliceRouteDeps) {
  app.get('/api/v1/me', async (request) => {
    const actor = requireAuth(request);
    const hasCitizen = !isPendingCitizen(actor.citizenId);
    let citizenExists = hasCitizen;
    if (hasCitizen) {
      const citizen = await deps.citizens.findById(actor.citizenId);
      citizenExists = citizen !== null;
    }

    return {
      accountId: actor.accountId,
      citizenId: hasCitizen && citizenExists ? actor.citizenId : null,
      roles: actor.roles,
      needsCitizenCreation: !hasCitizen || !citizenExists,
      correlationId: getCorrelationId(request),
    };
  });

  app.post(
    '/api/v1/citizens',
    {
      schema: {
        body: {
          type: 'object',
          required: ['displayName', 'gender', 'age'],
          properties: {
            displayName: { type: 'string', minLength: 2, maxLength: 64 },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other', 'prefer_not_to_say'],
            },
            age: { type: 'integer', minimum: 18, maximum: 120 },
            personality: {
              type: 'object',
              required: ['sympathy', 'reputation', 'happiness'],
              properties: {
                sympathy: { type: 'integer', minimum: 10, maximum: 50 },
                reputation: { type: 'integer', minimum: 10, maximum: 50 },
                happiness: { type: 'integer', minimum: 10, maximum: 50 },
              },
              additionalProperties: false,
            },
            portraitId: { type: 'string', minLength: 10, maxLength: 12 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      const actor = requireAuth(request);
      if (!isPendingCitizen(actor.citizenId)) {
        const existing = await deps.citizens.findById(actor.citizenId);
        if (existing) {
          throw new AppError('CONFLICT', 'CITIZEN_ALREADY_EXISTS', 'error.citizen.already_exists');
        }
      }

      const body = request.body as {
        displayName: string;
        gender: string;
        age: number;
        personality?: { sympathy: number; reputation: number; happiness: number };
        portraitId?: string;
      };
      const result = await deps.citizenService.createCitizen({
        accountId: actor.accountId,
        sessionId: actor.sessionId,
        displayName: body.displayName,
        gender: body.gender,
        age: body.age,
        personality: body.personality,
        portraitId: body.portraitId,
      });

      return {
        success: true,
        citizenId: result.citizenId,
        displayName: result.displayName,
        gender: result.gender,
        age: result.age,
        demoTaskInstanceId: result.demoTaskInstanceId,
        correlationId: getCorrelationId(request),
      };
    },
  );

  app.get('/api/v1/home', async (request) => {
    const actor = requireCitizen(request);
    const gameTime = await deps.worldClock.now();
    const summary = await deps.homeService.getHomeSummary(
      actor.citizenId,
      gameTime,
      getCorrelationId(request),
    );
    return {
      ...summary,
      correlationId: getCorrelationId(request),
    };
  });

  app.get('/api/v1/career', async (request) => {
    const actor = requireCitizen(request);
    if (!deps.careerService) {
      throw new AppError('TECHNICAL', 'CAREER_UNAVAILABLE', 'error.technical.internal');
    }
    const career = await deps.careerService.getCareerView(actor.citizenId);
    return {
      career,
      correlationId: getCorrelationId(request),
    };
  });

  app.get('/api/v1/tasks/active', async (request) => {
    const actor = requireCitizen(request);
    const tasks = await deps.taskService.getActiveTasks(
      actor.citizenId,
      getCorrelationId(request),
    );
    return {
      tasks,
      correlationId: getCorrelationId(request),
    };
  });

  app.post(
    '/api/v1/tasks/:instanceId/start',
    {
      schema: {
        params: {
          type: 'object',
          required: ['instanceId'],
          properties: {
            instanceId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { instanceId: string };

      const task = await deps.taskService.startTask({
        citizenId: actor.citizenId,
        taskInstanceId: params.instanceId,
        correlationId: getCorrelationId(request),
      });

      return {
        success: true,
        task,
        correlationId: getCorrelationId(request),
      };
    },
  );

  app.post(
    '/api/v1/tasks/:instanceId/complete',
    {
      schema: {
        params: {
          type: 'object',
          required: ['instanceId'],
          properties: {
            instanceId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['optionId'],
          properties: {
            optionId: { type: 'string', minLength: 1, maxLength: 128 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { instanceId: string };
      const body = request.body as { optionId: string };

      const result = await deps.taskService.completeTask({
        citizenId: actor.citizenId,
        taskInstanceId: params.instanceId,
        optionId: body.optionId,
        correlationId: getCorrelationId(request),
      });

      return {
        success: true,
        ...result,
        correlationId: getCorrelationId(request),
      };
    },
  );

  if (deps.flashOpportunities) {
    app.post(
      '/api/v1/flash-opportunities/:opportunityId/accept',
      {
        schema: {
          params: {
            type: 'object',
            required: ['opportunityId'],
            properties: {
              opportunityId: { type: 'string', format: 'uuid' },
            },
          },
        },
      },
      async (request) => {
        const actor = requireCitizen(request);
        const params = request.params as { opportunityId: string };
        const result = await deps.flashOpportunities!.accept({
          citizenId: actor.citizenId,
          opportunityId: params.opportunityId,
          nowMs: Date.now(),
          correlationId: getCorrelationId(request),
        });
        return { success: true, ...result, correlationId: getCorrelationId(request) };
      },
    );

    app.post(
      '/api/v1/flash-opportunities/:opportunityId/decline',
      {
        schema: {
          params: {
            type: 'object',
            required: ['opportunityId'],
            properties: {
              opportunityId: { type: 'string', format: 'uuid' },
            },
          },
        },
      },
      async (request) => {
        const actor = requireCitizen(request);
        const params = request.params as { opportunityId: string };
        const result = await deps.flashOpportunities!.decline({
          citizenId: actor.citizenId,
          opportunityId: params.opportunityId,
          nowMs: Date.now(),
        });
        return { success: true, ...result, correlationId: getCorrelationId(request) };
      },
    );
  }

  if (deps.worldEvents) {
    app.post(
      '/api/v1/world-events/:eventId/dismiss-popup',
      {
        schema: {
          params: {
            type: 'object',
            required: ['eventId'],
            properties: {
              eventId: { type: 'string', minLength: 1 },
            },
          },
        },
      },
      async (request) => {
        const actor = requireCitizen(request);
        const params = request.params as { eventId: string };
        const result = await deps.worldEvents!.dismissPopup({
          citizenId: actor.citizenId,
          worldEventId: params.eventId,
        });
        return { success: true, ...result, correlationId: getCorrelationId(request) };
      },
    );
  }

  app.patch(
    '/api/v1/profile/portrait',
    {
      schema: {
        body: {
          type: 'object',
          required: ['portraitId'],
          properties: {
            portraitId: { type: 'string', minLength: 10, maxLength: 12 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const body = request.body as { portraitId: string };
      const result = await deps.citizenService.updatePortrait({
        citizenId: actor.citizenId,
        portraitId: body.portraitId,
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.delete('/api/v1/account', async (request) => {
    const actor = requireAuth(request);
    await deps.citizenService.deleteAccount({
      accountId: actor.accountId,
      sessionId: actor.sessionId,
    });
    return { success: true, correlationId: getCorrelationId(request) };
  });
}
