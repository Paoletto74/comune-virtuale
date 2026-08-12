import type { FastifyInstance } from 'fastify';
import type { AuthService } from '../../application/auth/auth-service.js';
import type { ApprovedContentLoader } from '../../infrastructure/content/approved-content-loader.js';
import type { ContentLoadResult } from '@comune-virtuale/shared';
import { requireAuth } from '../plugins/auth-plugin.js';
import { AppError } from '../plugins/error-handler-plugin.js';
import { SESSION_COOKIE } from '../../application/auth/auth-service.js';
import { getCorrelationId } from '../plugins/correlation-plugin.js';
import { registerSliceRoutes, type SliceRouteDeps } from './slice-routes.js';
import { registerAdminTimeRoutes } from './admin-time-routes.js';
import { registerAdminFlashRoutes } from './admin-flash-routes.js';
import { registerAdminContextRoutes } from './admin-context-routes.js';
import type { FlashOpportunityService } from '../../application/flash/flash-opportunity-service.js';
import type { GameSurfaceService } from '../../application/game-surface/game-surface-service.js';
import { registerGameSurfaceRoutes } from './game-surface-routes.js';
import { registerGoogleAuthRoutes } from './google-auth-routes.js';
import { registerSocialRoutes } from './social-routes.js';
import { registerPreviewRoutes } from './preview-routes.js';
import type { GoogleOAuthConfig } from '../../config/index.js';
import type { AdminContextService } from '../../application/admin/admin-context-service.js';
import type { SocialGameplayService } from '../../application/social/social-gameplay-service.js';
import type { PreviewBootstrapService } from '../../application/dev/preview-bootstrap-service.js';
import type { AssetCatalogService } from '../../application/dev/asset-catalog-service.js';
import { registerDevAssetRoutes } from './dev-asset-routes.js';

export interface RouteDeps extends SliceRouteDeps {
  authService: AuthService;
  contentLoader: ApprovedContentLoader;
  enableDevAuth: boolean;
  googleOAuth: GoogleOAuthConfig | null;
  frontendOrigin: string;
  contentCache: { result: ContentLoadResult | null };
  flashOpportunities?: FlashOpportunityService;
  gameSurface?: GameSurfaceService;
  adminContext?: AdminContextService;
  socialGameplay?: SocialGameplayService;
  previewBootstrap?: PreviewBootstrapService;
  assetCatalog?: AssetCatalogService;
}

export async function registerRoutes(app: FastifyInstance, deps: RouteDeps) {
  app.get('/health', async (request) => {
    return {
      status: 'ok',
      correlationId: getCorrelationId(request),
      phase: '2-vertical-slice-v1',
    };
  });

  app.get('/api/v1/time', async () => {
    return deps.worldClock.now();
  });

  app.get('/api/v1/content/summary', async () => {
    if (!deps.contentCache.result) {
      deps.contentCache.result = await deps.contentLoader.load();
    }
    return deps.contentCache.result;
  });

  await registerSliceRoutes(app, deps);
  await registerGoogleAuthRoutes(app, {
    authService: deps.authService,
    citizens: deps.citizens,
    googleOAuth: deps.googleOAuth,
    frontendOrigin: deps.frontendOrigin,
  });
  await registerGameSurfaceRoutes(app, {
    worldClock: deps.worldClock,
    gameSurface: deps.gameSurface,
  });
  await registerAdminTimeRoutes(app, {
    worldClock: deps.worldClock,
    enableDevAuth: deps.enableDevAuth,
  });

  if (deps.flashOpportunities) {
    await registerAdminFlashRoutes(app, {
      flashOpportunities: deps.flashOpportunities,
      enableDevAuth: deps.enableDevAuth,
    });
  }

  if (deps.adminContext) {
    await registerAdminContextRoutes(app, { adminContext: deps.adminContext });
  }

  if (deps.socialGameplay) {
    await registerSocialRoutes(app, { socialGameplay: deps.socialGameplay });
  }

  await registerPreviewRoutes(app, {
    enableDevAuth: deps.enableDevAuth,
    previewBootstrap: deps.previewBootstrap,
  });

  await registerDevAssetRoutes(app, {
    enableDevAuth: deps.enableDevAuth,
    assetCatalog: deps.assetCatalog,
  });

  app.post(
    '/api/v1/auth/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['devAccountId'],
          properties: {
            devAccountId: { type: 'string', minLength: 1 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      if (!deps.enableDevAuth) {
        throw new AppError('PERMISSION', 'DEV_AUTH_DISABLED', 'error.auth.dev_disabled');
      }

      const body = request.body as { devAccountId: string };
      const existingCitizen = await deps.citizens.findByAccountId(body.devAccountId);
      const { sessionId } = await deps.authService.createDevSession(
        body.devAccountId,
        existingCitizen?.citizenId,
      );

      reply.setCookie(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      });

      return {
        success: true,
        accountId: body.devAccountId,
        citizenId: existingCitizen?.citizenId ?? null,
        needsCitizenCreation: !existingCitizen,
        correlationId: getCorrelationId(request),
      };
    },
  );

  app.post('/api/v1/auth/logout', async (request, reply) => {
    requireAuth(request);
    const sessionId = request.cookies[SESSION_COOKIE];
    if (sessionId) {
      await deps.authService.logout(sessionId);
    }
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { success: true, correlationId: getCorrelationId(request) };
  });

  if (deps.enableDevAuth) {
    app.post(
      '/api/v1/_dev/idempotency-test',
      {
        schema: {
          body: {
            type: 'object',
            properties: {
              value: { type: 'string' },
            },
          },
        },
      },
      async (request) => {
        requireAuth(request);
        const body = request.body as { value?: string };
        return {
          echoed: body.value ?? 'ok',
          correlationId: getCorrelationId(request),
        };
      },
    );
  }
}
