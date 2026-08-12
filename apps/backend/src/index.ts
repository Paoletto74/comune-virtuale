import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { loadConfig } from './config/index.js';
import { createDatabase } from './infrastructure/db/client.js';
import { DrizzleWorldClockRepository } from './infrastructure/db/repositories/world-clock-repository.js';
import { DrizzleSessionRepository } from './infrastructure/db/repositories/session-repository.js';
import { DrizzleIdempotencyRepository } from './infrastructure/db/repositories/idempotency-repository.js';
import { DrizzleAuditLogRepository } from './infrastructure/db/repositories/audit-log-repository.js';
import { WorldClockService } from './domain/time/world-clock-service.js';
import { AuthService } from './application/auth/auth-service.js';
import { ApprovedContentLoader } from './infrastructure/content/approved-content-loader.js';
import { correlationPlugin } from './api/plugins/correlation-plugin.js';
import { errorHandlerPlugin } from './api/plugins/error-handler-plugin.js';
import { createAuthPlugin } from './api/plugins/auth-plugin.js';
import { createIdempotencyPlugin } from './api/plugins/idempotency-plugin.js';
import { createAuditPlugin } from './api/plugins/audit-plugin.js';
import { registerRoutes } from './api/routes/index.js';
import { DrizzleCitizenRepository } from './infrastructure/db/repositories/citizen-repository.js';
import { DrizzleTaskRepository } from './infrastructure/db/repositories/task-repository.js';
import { DrizzleEconomyRepository } from './infrastructure/db/repositories/economy-repository.js';
import { DrizzleNpcRepository } from './infrastructure/db/repositories/npc-repository.js';
import { DrizzleRiskOutcomeRepository } from './infrastructure/db/repositories/risk-outcome-repository.js';
import { NpcRelationshipService } from './application/npc/npc-relationship-service.js';
import { NpcTaskTargetResolver } from './application/npc/npc-task-target-resolver.js';
import { NpcService } from './application/npc/npc-service.js';
import { DrizzleCitizenNpcRelationshipRepository } from './infrastructure/db/repositories/citizen-npc-relationship-repository.js';
import {
  DrizzleCitizenLifeEvolutionRepository,
  DrizzleCitizenTemporalEventRepository,
} from './infrastructure/db/repositories/citizen-life-evolution-repository.js';
import { CitizenLifeEvolutionService } from './application/life/citizen-life-evolution-service.js';
import { LifeReviewService } from './application/life/life-review-service.js';
import { FlashOpportunityService } from './application/flash/flash-opportunity-service.js';
import {
  DrizzleFlashOpportunityRepository,
  DrizzleCitizenFlashSpawnStateRepository,
} from './infrastructure/db/repositories/flash-opportunity-repository.js';
import { CitizenService } from './application/citizen/citizen-service.js';
import { CitizenProfileService } from './application/citizen/citizen-profile-service.js';
import { CitizenProgressionService } from './application/citizen/citizen-progression-service.js';
import { WorldEventService } from './application/world/world-event-service.js';
import { DrizzleWorldEventRepository } from './infrastructure/db/repositories/world-event-repository.js';
import { StoryThreadService } from './application/story/story-thread-service.js';
import { DrizzleStoryThreadRepository } from './infrastructure/db/repositories/story-thread-repository.js';
import { TaskService } from './application/task/task-service.js';
import { TaskInstanceMaterializer } from './application/task/task-instance-materializer.js';
import { TaskSelectionService } from './application/task/task-selection-service.js';
import { TaskFeedPhaseRefreshService } from './application/task/task-feed-phase-refresh-service.js';
import { HomeService } from './application/home/home-service.js';
import { EconomyService } from './application/economy/economy-service.js';
import { GameSurfaceService } from './application/game-surface/game-surface-service.js';
import { DrizzleGameSurfaceRepository } from './infrastructure/db/repositories/game-surface-repository.js';
import { RiskService } from './application/risk/risk-service.js';
import type { ContentLoadResult } from '@comune-virtuale/shared';
import { loadAdminAccountIds } from './slice/admin-constants.js';
import { DrizzleNpcPortraitAssignmentRepository } from './infrastructure/db/repositories/npc-portrait-assignment-repository.js';
import { DrizzleCitizenCareerRepository } from './infrastructure/db/repositories/citizen-career-repository.js';
import { AdminContextService } from './application/admin/admin-context-service.js';
import { CitizenCareerService } from './application/citizen/citizen-career-service.js';
import { CareerProgressionService } from './application/citizen/career-progression-service.js';
import { DrizzleSocialGameplayRepository } from './infrastructure/db/repositories/social-gameplay-repository.js';
import { SocialGameplayService } from './application/social/social-gameplay-service.js';
import { PreviewBootstrapService } from './application/dev/preview-bootstrap-service.js';
import { AssetCatalogService } from './application/dev/asset-catalog-service.js';

config({ path: resolve(import.meta.dirname, '../../../.env') });

const appConfig = loadConfig();
const adminAccountIds = loadAdminAccountIds();
const contentRoot = resolve(appConfig.contentRoot);

async function main() {
  const app = Fastify({
    logger: {
      level: appConfig.logLevel,
    },
  });

  const { db, client } = createDatabase(appConfig.databaseUrl);

  const worldClockRepo = new DrizzleWorldClockRepository(db);
  const sessionRepo = new DrizzleSessionRepository(db);
  const idempotencyRepo = new DrizzleIdempotencyRepository(db);
  const auditRepo = new DrizzleAuditLogRepository(db);

  const worldClockService = new WorldClockService(worldClockRepo);
  const authService = new AuthService(sessionRepo, appConfig.sessionTtlSeconds, adminAccountIds);
  const contentLoader = new ApprovedContentLoader(contentRoot);
  const contentCache: { result: ContentLoadResult | null } = { result: null };

  await app.register(helmet);
  await app.register(cors, {
    origin: appConfig.corsOrigin,
    credentials: true,
  });
  await app.register(cookie, {
    secret: appConfig.sessionSecret,
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(correlationPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(createAuthPlugin(authService));
  await app.register(createIdempotencyPlugin(idempotencyRepo, appConfig.idempotencyTtlSeconds));
  await app.register(createAuditPlugin(auditRepo, worldClockService));

  const economyRepo = new DrizzleEconomyRepository(db);
  const riskOutcomeRepo = new DrizzleRiskOutcomeRepository(db);
  const npcRepo = new DrizzleNpcRepository(db);
  const npcRelationshipRepo = new DrizzleCitizenNpcRelationshipRepository(db);
  const npcPortraitAssignmentRepo = new DrizzleNpcPortraitAssignmentRepository(db);
  const npcService = new NpcService(npcRepo, economyRepo);
  const npcRelationshipService = new NpcRelationshipService(
    npcRepo,
    npcRelationshipRepo,
    npcPortraitAssignmentRepo,
  );
  const npcTaskTargetResolver = new NpcTaskTargetResolver(npcService, npcRelationshipService);
  const taskMaterializer = new TaskInstanceMaterializer(npcTaskTargetResolver);
  const citizenRepo = new DrizzleCitizenRepository(db, economyRepo);
  const taskRepo = new DrizzleTaskRepository(db);
  const citizenProfileService = new CitizenProfileService(citizenRepo);
  const citizenCareerRepo = new DrizzleCitizenCareerRepository(db);
  const citizenCareerService = new CitizenCareerService(citizenCareerRepo);
  const careerProgressionService = new CareerProgressionService(citizenCareerRepo, citizenRepo);
  const lifeEvolutionRepo = new DrizzleCitizenLifeEvolutionRepository(db);
  const temporalEventRepo = new DrizzleCitizenTemporalEventRepository(db);
  const citizenProgressionService = new CitizenProgressionService(citizenRepo, temporalEventRepo);
  const socialGameplayRepo = new DrizzleSocialGameplayRepository(db);
  const socialGameplayService = new SocialGameplayService(
    npcRelationshipRepo,
    npcRepo,
    socialGameplayRepo,
    citizenRepo,
    npcPortraitAssignmentRepo,
    careerProgressionService,
    citizenProgressionService,
  );
  const lifeEvolutionService = new CitizenLifeEvolutionService(lifeEvolutionRepo, temporalEventRepo);
  const lifeReviewService = new LifeReviewService(
    lifeEvolutionRepo,
    temporalEventRepo,
    citizenProgressionService,
  );
  const worldEventRepo = new DrizzleWorldEventRepository(db);
  const storyThreadRepo = new DrizzleStoryThreadRepository(db);
  const storyThreadService = new StoryThreadService(storyThreadRepo, temporalEventRepo);
  const worldEventService = new WorldEventService(
    worldEventRepo,
    temporalEventRepo,
    storyThreadService,
  );
  const economyService = new EconomyService(economyRepo);
  const previewBootstrapService = new PreviewBootstrapService(
    citizenRepo,
    economyService,
    citizenProgressionService,
    citizenCareerRepo,
    npcRelationshipService,
    npcRelationshipRepo,
    taskRepo,
    taskMaterializer,
    socialGameplayService,
    socialGameplayRepo,
  );
  const assetCatalogService = new AssetCatalogService();
  const gameSurfaceRepo = new DrizzleGameSurfaceRepository(db);
  const taskSelection = new TaskSelectionService(
    taskRepo,
    taskMaterializer,
    undefined,
    undefined,
    undefined,
    citizenProfileService,
    npcRelationshipRepo,
    worldEventService,
    worldClockService,
    storyThreadService,
    gameSurfaceRepo,
  );

  const gameSurfaceService = new GameSurfaceService(
    gameSurfaceRepo,
    temporalEventRepo,
    economyService,
    citizenRepo,
    worldEventRepo,
    lifeEvolutionService,
    citizenProfileService,
    npcPortraitAssignmentRepo,
    citizenProgressionService,
    citizenCareerService,
  );
  const adminContextService = new AdminContextService(citizenRepo, npcPortraitAssignmentRepo);
  const flashOpportunityRepo = new DrizzleFlashOpportunityRepository(db);
  const flashSpawnStateRepo = new DrizzleCitizenFlashSpawnStateRepository(db);
  const flashOpportunityService = new FlashOpportunityService(
    flashOpportunityRepo,
    flashSpawnStateRepo,
    economyService,
    citizenRepo,
    citizenProfileService,
    citizenProgressionService,
    worldEventService,
    storyThreadService,
    worldClockService,
  );
  const riskService = new RiskService(riskOutcomeRepo);
  const taskFeedPhaseRefresh = new TaskFeedPhaseRefreshService(
    taskRepo,
    citizenRepo,
    taskSelection,
    worldClockService,
  );
  const citizenService = new CitizenService(
    citizenRepo,
    sessionRepo,
    taskSelection,
    citizenProfileService,
    lifeEvolutionService,
    worldClockService,
    citizenCareerService,
  );
  const taskService = new TaskService(
    taskRepo,
    citizenRepo,
    economyService,
    undefined,
    riskService,
    undefined,
    taskMaterializer,
    taskSelection,
    citizenProfileService,
    npcRelationshipService,
    citizenProgressionService,
    worldClockService,
    storyThreadService,
    taskFeedPhaseRefresh,
    gameSurfaceRepo,
    careerProgressionService,
    npcRelationshipRepo,
    socialGameplayService,
  );
  const homeService = new HomeService(
    citizenRepo,
    taskRepo,
    taskService,
    economyService,
    citizenProfileService,
    npcRelationshipService,
    lifeReviewService,
    flashOpportunityService,
    citizenProgressionService,
    citizenCareerService,
    worldEventService,
    storyThreadService,
    gameSurfaceService,
    socialGameplayService,
  );

  await registerRoutes(app, {
    worldClock: worldClockService,
    authService,
    contentLoader,
    enableDevAuth: appConfig.enableDevAuth,
    googleOAuth: appConfig.googleOAuth,
    frontendOrigin: appConfig.googleOAuth?.frontendOrigin ?? appConfig.corsOrigin,
    contentCache,
    citizenService,
    taskService,
    homeService,
    citizens: citizenRepo,
    careerService: citizenCareerService,
    flashOpportunities: flashOpportunityService,
    gameSurface: gameSurfaceService,
    worldEvents: worldEventService,
    adminContext: adminContextService,
    socialGameplay: socialGameplayService,
    previewBootstrap: previewBootstrapService,
    assetCatalog: assetCatalogService,
  });

  // Pre-load approved content at startup (read-only)
  try {
    contentCache.result = await contentLoader.load();
    app.log.info(
      { packCount: contentCache.result.packs.length },
      'Loaded APPROVATO content packs',
    );
  } catch (err) {
    app.log.error({ err }, 'Failed to load APPROVATO content packs');
    process.exit(1);
  }

  // World clock tick — uses persisted timeScale and respects pause
  const tickIntervalMs = 1000;
  setInterval(() => {
    worldClockService
      .now()
      .then((snapshot) => {
        if (snapshot.isPaused) return snapshot;
        const delta = Math.floor(tickIntervalMs * snapshot.timeScale);
        return worldClockService.tick(delta);
      })
      .catch((err) => {
        app.log.error({ err }, 'World clock tick failed');
      });
  }, tickIntervalMs);

  const shutdown = async () => {
    await app.close();
    await client.end();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await app.listen({ port: appConfig.port, host: '0.0.0.0' });
  app.log.info(`Backend listening on port ${appConfig.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
