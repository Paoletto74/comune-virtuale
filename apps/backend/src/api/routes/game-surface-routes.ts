import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import type { GameSurfaceService } from '../../application/game-surface/game-surface-service.js';
import type { WorldClockService } from '../../domain/time/world-clock-service.js';
import { requireCitizen } from '../plugins/auth-plugin.js';
import { getCorrelationId } from '../plugins/correlation-plugin.js';
import { IDEMPOTENCY_HEADER } from '@comune-virtuale/shared';

export interface GameSurfaceRouteDeps {
  worldClock: WorldClockService;
  gameSurface?: GameSurfaceService;
}

export async function registerGameSurfaceRoutes(app: FastifyInstance, deps: GameSurfaceRouteDeps) {
  if (!deps.gameSurface) return;

  app.get('/api/v1/gazzetta', async (request) => {
    const actor = requireCitizen(request);
    const gameTime = await deps.worldClock.now();
    const gameTimeMs = Number(gameTime.worldTimeMs);
    const feed = await deps.gameSurface!.getGazzettaArticles(actor.citizenId, gameTimeMs);
    return { ...feed, correlationId: getCorrelationId(request) };
  });

  app.get('/api/v1/notifications', async (request) => {
    const actor = requireCitizen(request);
    const query = request.query as { scope?: string };
    const scope = query.scope === 'global' ? 'global' : 'personal';
    const gameTime = await deps.worldClock.now();
    const gameTimeMs = Number(gameTime.worldTimeMs);
    const feed = await deps.gameSurface!.getNotifications(actor.citizenId, scope, gameTimeMs);
    return { ...feed, correlationId: getCorrelationId(request) };
  });

  app.get('/api/v1/referendums', async (request) => {
    const actor = requireCitizen(request);
    const gameTime = await deps.worldClock.now();
    const gameTimeMs = Number(gameTime.worldTimeMs);
    const feed = await deps.gameSurface!.getReferendums(actor.citizenId, gameTimeMs);
    return { ...feed, correlationId: getCorrelationId(request) };
  });

  app.post(
    '/api/v1/referendums/:id/vote',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', minLength: 1 } },
        },
        body: {
          type: 'object',
          required: ['optionId'],
          properties: {
            optionId: { type: 'string', enum: ['a', 'b'] },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { id: string };
      const body = request.body as { optionId: 'a' | 'b' };
      const gameTime = await deps.worldClock.now();
      const result = await deps.gameSurface!.voteReferendum({
        citizenId: actor.citizenId,
        referendumId: params.id,
        optionId: body.optionId,
        gameTimeMs: Number(gameTime.worldTimeMs),
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.get('/api/v1/marketplace', async (request) => {
    const actor = requireCitizen(request);
    const gameTime = await deps.worldClock.now();
    const feed = await deps.gameSurface!.getMarketplace(actor.citizenId, Number(gameTime.worldTimeMs));
    return { ...feed, correlationId: getCorrelationId(request) };
  });

  app.post(
    '/api/v1/marketplace/:itemId/purchase',
    {
      schema: {
        params: {
          type: 'object',
          required: ['itemId'],
          properties: { itemId: { type: 'string', minLength: 1 } },
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { itemId: string };
      const gameTime = await deps.worldClock.now();
      const result = await deps.gameSurface!.purchaseItem({
        citizenId: actor.citizenId,
        itemId: params.itemId,
        gameTimeMs: Number(gameTime.worldTimeMs),
        correlationId: getCorrelationId(request),
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.post(
    '/api/v1/marketplace/:itemId/sell',
    {
      schema: {
        params: {
          type: 'object',
          required: ['itemId'],
          properties: { itemId: { type: 'string', minLength: 1 } },
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { itemId: string };
      const gameTime = await deps.worldClock.now();
      const clientKey = request.headers['x-idempotency-key'] as string | undefined;
      const result = await deps.gameSurface!.sellItem({
        citizenId: actor.citizenId,
        itemId: params.itemId,
        gameTimeMs: Number(gameTime.worldTimeMs),
        clientKey: clientKey ?? randomUUID(),
        correlationId: getCorrelationId(request),
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.post(
    '/api/v1/marketplace/listings',
    {
      schema: {
        body: {
          type: 'object',
          required: ['itemId'],
          properties: {
            itemId: { type: 'string', minLength: 1 },
            listingType: { type: 'string', enum: ['sale', 'rent'] },
          },
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const body = request.body as { itemId: string; listingType?: 'sale' | 'rent' };
      const gameTime = await deps.worldClock.now();
      const clientKey = request.headers['x-idempotency-key'] as string | undefined;
      const result = await deps.gameSurface!.createPlayerListing({
        citizenId: actor.citizenId,
        itemId: body.itemId,
        listingType: body.listingType,
        gameTimeMs: Number(gameTime.worldTimeMs),
        clientKey: clientKey ?? randomUUID(),
        correlationId: getCorrelationId(request),
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.post(
    '/api/v1/marketplace/listings/:listingId/buy',
    {
      schema: {
        params: {
          type: 'object',
          required: ['listingId'],
          properties: { listingId: { type: 'string', minLength: 1 } },
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { listingId: string };
      const gameTime = await deps.worldClock.now();
      const clientKey = request.headers['x-idempotency-key'] as string | undefined;
      const result = await deps.gameSurface!.buyPlayerListing({
        citizenId: actor.citizenId,
        listingId: params.listingId,
        gameTimeMs: Number(gameTime.worldTimeMs),
        clientKey: clientKey ?? randomUUID(),
        correlationId: getCorrelationId(request),
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.post(
    '/api/v1/marketplace/:itemId/rent',
    {
      schema: {
        params: {
          type: 'object',
          required: ['itemId'],
          properties: { itemId: { type: 'string', minLength: 1 } },
        },
        body: {
          type: 'object',
          properties: {
            listingId: { type: 'string' },
          },
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { itemId: string };
      const body = request.body as { listingId?: string };
      const gameTime = await deps.worldClock.now();
      const clientKey = request.headers['x-idempotency-key'] as string | undefined;
      const result = await deps.gameSurface!.rentMarketplaceItem({
        citizenId: actor.citizenId,
        itemId: params.itemId,
        gameTimeMs: Number(gameTime.worldTimeMs),
        clientKey: clientKey ?? randomUUID(),
        listingId: body.listingId,
        correlationId: getCorrelationId(request),
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.get('/api/v1/jobs', async (request) => {
    const actor = requireCitizen(request);
    const gameTime = await deps.worldClock.now();
    const feed = await deps.gameSurface!.getJobOffers(
      actor.citizenId,
      Number(gameTime.worldTimeMs),
    );
    return { ...feed, correlationId: getCorrelationId(request) };
  });

  app.post(
    '/api/v1/jobs/:offerId/apply',
    {
      schema: {
        params: {
          type: 'object',
          required: ['offerId'],
          properties: { offerId: { type: 'string', minLength: 1 } },
        },
        body: {
          type: 'object',
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { offerId: string };
      const gameTime = await deps.worldClock.now();
      const clientKey =
        (request.headers[IDEMPOTENCY_HEADER.toLowerCase()] as string | undefined) ??
        getCorrelationId(request);
      const result = await deps.gameSurface!.applyForJob({
        citizenId: actor.citizenId,
        offerId: params.offerId,
        gameTimeMs: Number(gameTime.worldTimeMs),
        clientKey,
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.post(
    '/api/v1/jobs/:offerId/clock-in',
    {
      schema: {
        params: {
          type: 'object',
          required: ['offerId'],
          properties: { offerId: { type: 'string', minLength: 1 } },
        },
        body: {
          type: 'object',
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { offerId: string };
      const gameTime = await deps.worldClock.now();
      const result = await deps.gameSurface!.clockInJob({
        citizenId: actor.citizenId,
        offerId: params.offerId,
        gameTimeMs: Number(gameTime.worldTimeMs),
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.post(
    '/api/v1/jobs/:offerId/accept',
    {
      schema: {
        params: {
          type: 'object',
          required: ['offerId'],
          properties: { offerId: { type: 'string', minLength: 1 } },
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { offerId: string };
      const gameTime = await deps.worldClock.now();
      const clientKey =
        (request.headers[IDEMPOTENCY_HEADER.toLowerCase()] as string | undefined) ??
        getCorrelationId(request);
      const result = await deps.gameSurface!.acceptJob({
        citizenId: actor.citizenId,
        offerId: params.offerId,
        gameTimeMs: Number(gameTime.worldTimeMs),
        clientKey,
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.get('/api/v1/municipality', async (request) => {
    requireCitizen(request);
    const gameTime = await deps.worldClock.now();
    const overview = await deps.gameSurface!.getMunicipalityOverview(Number(gameTime.worldTimeMs));
    return { ...overview, correlationId: getCorrelationId(request) };
  });

  app.get('/api/v1/rankings', async (request) => {
    requireCitizen(request);
    const gameTime = await deps.worldClock.now();
    const rankings = await deps.gameSurface!.getRankings(Number(gameTime.worldTimeMs));
    return { ...rankings, correlationId: getCorrelationId(request) };
  });

  app.get('/api/v1/citizens', async (request) => {
    requireCitizen(request);
    const gameTime = await deps.worldClock.now();
    const directory = await deps.gameSurface!.getCitizensDirectory(Number(gameTime.worldTimeMs));
    return { ...directory, correlationId: getCorrelationId(request) };
  });

  app.get('/api/v1/citizens/:id/public', async (request) => {
    requireCitizen(request);
    const params = request.params as { id: string };
    const profile = await deps.gameSurface!.getPublicProfile(params.id);
    return { ...profile, correlationId: getCorrelationId(request) };
  });

  app.post(
    '/api/v1/citizens/:id/message',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', minLength: 1 } },
        },
        body: {
          type: 'object',
          required: ['body'],
          properties: {
            body: { type: 'string', minLength: 1, maxLength: 500 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { id: string };
      const body = request.body as { body: string };
      const gameTime = await deps.worldClock.now();
      const clientKey =
        (request.headers[IDEMPOTENCY_HEADER.toLowerCase()] as string | undefined) ??
        getCorrelationId(request);
      const result = await deps.gameSurface!.sendMessage({
        fromCitizenId: actor.citizenId,
        toCitizenId: params.id,
        body: body.body,
        gameTimeMs: Number(gameTime.worldTimeMs),
        clientKey,
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.post(
    '/api/v1/citizens/:id/gift',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', minLength: 1 } },
        },
        body: {
          type: 'object',
          required: ['amountMinor'],
          properties: {
            amountMinor: { type: 'string', minLength: 1 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { id: string };
      const body = request.body as { amountMinor: string };
      const gameTime = await deps.worldClock.now();
      const clientKey =
        (request.headers[IDEMPOTENCY_HEADER.toLowerCase()] as string | undefined) ??
        getCorrelationId(request);
      const result = await deps.gameSurface!.giftCash({
        fromCitizenId: actor.citizenId,
        toCitizenId: params.id,
        amountMinor: BigInt(body.amountMinor),
        gameTimeMs: Number(gameTime.worldTimeMs),
        clientKey,
        correlationId: getCorrelationId(request),
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.post(
    '/api/v1/citizens/:id/loan',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', minLength: 1 } },
        },
        body: {
          type: 'object',
          required: ['amountMinor'],
          properties: {
            amountMinor: { type: 'string', minLength: 1 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request) => {
      const actor = requireCitizen(request);
      const params = request.params as { id: string };
      const body = request.body as { amountMinor: string };
      const gameTime = await deps.worldClock.now();
      const clientKey =
        (request.headers[IDEMPOTENCY_HEADER.toLowerCase()] as string | undefined) ??
        getCorrelationId(request);
      const result = await deps.gameSurface!.loanCash({
        fromCitizenId: actor.citizenId,
        toCitizenId: params.id,
        amountMinor: BigInt(body.amountMinor),
        gameTimeMs: Number(gameTime.worldTimeMs),
        clientKey,
        correlationId: getCorrelationId(request),
      });
      return { success: true, ...result, correlationId: getCorrelationId(request) };
    },
  );

  app.get('/api/v1/profile/detail', async (request) => {
    const actor = requireCitizen(request);
    const gameTime = await deps.worldClock.now();
    const detail = await deps.gameSurface!.getProfileDetail(
      actor.citizenId,
      Number(gameTime.worldTimeMs),
    );
    return { ...detail, correlationId: getCorrelationId(request) };
  });
}
