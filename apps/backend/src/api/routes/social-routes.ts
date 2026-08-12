import type { FastifyInstance } from 'fastify';
import { getCorrelationId } from '../plugins/correlation-plugin.js';
import { requireAuth } from '../plugins/auth-plugin.js';
import type { SocialGameplayService } from '../../application/social/social-gameplay-service.js';

export interface SocialRouteDeps {
  socialGameplay?: SocialGameplayService;
}

export async function registerSocialRoutes(app: FastifyInstance, deps: SocialRouteDeps): Promise<void> {
  app.get('/api/v1/relazioni', async (request) => {
    const actor = await requireAuth(request);
    if (!deps.socialGameplay) {
      return { people: [], groups: [], spontaneousInbox: [] };
    }
    const overview = await deps.socialGameplay.getRelazioniOverview(actor.citizenId);
    return overview;
  });

  app.get<{ Params: { npcId: string } }>('/api/v1/relazioni/npc/:npcId', async (request) => {
    const actor = await requireAuth(request);
    if (!deps.socialGameplay) {
      return { error: 'not_available' };
    }
    const profile = await deps.socialGameplay.getNpcProfile(actor.citizenId, request.params.npcId);
    return { profile };
  });

  app.post<{ Params: { npcId: string }; Body: { idempotencyKey?: string; localHour?: number } }>(
    '/api/v1/relazioni/npc/:npcId/chat/free/start',
    async (request) => {
      const actor = await requireAuth(request);
      if (!deps.socialGameplay) {
        return { error: 'not_available' };
      }
      const body = request.body ?? {};
      const chat = await deps.socialGameplay.startFreeChat({
        citizenId: actor.citizenId,
        npcId: request.params.npcId,
        idempotencyKey: body.idempotencyKey ?? `${getCorrelationId(request)}:chat:free:start`,
        localHour: body.localHour,
      });
      return { chat };
    },
  );

  app.post<{ Params: { threadId: string }; Body: { message: string; idempotencyKey?: string; localHour?: number } }>(
    '/api/v1/relazioni/chat/:threadId/message',
    async (request) => {
      const actor = await requireAuth(request);
      if (!deps.socialGameplay) {
        return { error: 'not_available' };
      }
      const body = request.body ?? {};
      const chat = await deps.socialGameplay.sendFreeMessage({
        citizenId: actor.citizenId,
        threadId: request.params.threadId,
        message: body.message ?? '',
        idempotencyKey: body.idempotencyKey ?? `${getCorrelationId(request)}:chat:msg`,
        localHour: body.localHour,
      });
      return { chat };
    },
  );

  app.post<{ Params: { npcId: string }; Body: { scenarioId: string; idempotencyKey?: string; localHour?: number } }>(
    '/api/v1/relazioni/npc/:npcId/chat/start',
    async (request) => {
      const actor = await requireAuth(request);
      if (!deps.socialGameplay) {
        return { error: 'not_available' };
      }
      const body = request.body ?? {};
      const chat = await deps.socialGameplay.startChat({
        citizenId: actor.citizenId,
        npcId: request.params.npcId,
        scenarioId: body.scenarioId,
        idempotencyKey: body.idempotencyKey ?? `${getCorrelationId(request)}:chat:start`,
        localHour: body.localHour,
      });
      return { chat };
    },
  );

  app.post<{ Params: { threadId: string }; Body: { optionId: string; idempotencyKey?: string } }>(
    '/api/v1/relazioni/chat/:threadId/reply',
    async (request) => {
      const actor = await requireAuth(request);
      if (!deps.socialGameplay) {
        return { error: 'not_available' };
      }
      const body = request.body ?? {};
      const chat = await deps.socialGameplay.replyChat({
        citizenId: actor.citizenId,
        threadId: request.params.threadId,
        optionId: body.optionId,
        idempotencyKey: body.idempotencyKey ?? `${getCorrelationId(request)}:chat:reply:${body.optionId}`,
      });
      return { chat };
    },
  );

  app.post<{ Params: { inboxId: string }; Body: { idempotencyKey?: string; localHour?: number } }>(
    '/api/v1/relazioni/spontaneous/:inboxId/open',
    async (request) => {
      const actor = await requireAuth(request);
      if (!deps.socialGameplay) {
        return { error: 'not_available' };
      }
      const body = request.body ?? {};
      const chat = await deps.socialGameplay.openSpontaneousChat({
        citizenId: actor.citizenId,
        inboxId: request.params.inboxId,
        idempotencyKey: body.idempotencyKey ?? `${getCorrelationId(request)}:spontaneous:${request.params.inboxId}`,
        localHour: body.localHour,
      });
      return { chat };
    },
  );

  app.get<{ Params: { templateId: string } }>(
    '/api/v1/relazioni/scenarios/:templateId',
    async (request) => {
      await requireAuth(request);
      if (!deps.socialGameplay) {
        return { scenarios: [] };
      }
      const scenarios = deps.socialGameplay.listChatModesForNpc(request.params.templateId);
      return {
        scenarios: scenarios.map((s) => ({
          scenarioId: s.scenarioId,
          title: s.title,
          actionType: s.actionType ?? (s.mode === 'free' ? 'free' : 'chiacchiera'),
          mode: s.mode,
        })),
      };
    },
  );
}
