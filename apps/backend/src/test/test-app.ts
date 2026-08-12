import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { IDEMPOTENCY_HEADER } from '@comune-virtuale/shared';
import { randomUUID } from 'node:crypto';
import { loadConfig } from '../config/index.js';
import { createDatabase } from '../infrastructure/db/client.js';
import { DrizzleWorldClockRepository } from '../infrastructure/db/repositories/world-clock-repository.js';
import { DrizzleSessionRepository } from '../infrastructure/db/repositories/session-repository.js';
import { DrizzleIdempotencyRepository } from '../infrastructure/db/repositories/idempotency-repository.js';
import { DrizzleCitizenRepository } from '../infrastructure/db/repositories/citizen-repository.js';
import { DrizzleTaskRepository } from '../infrastructure/db/repositories/task-repository.js';
import { DrizzleEconomyRepository } from '../infrastructure/db/repositories/economy-repository.js';
import { DrizzleNpcRepository } from '../infrastructure/db/repositories/npc-repository.js';
import { DrizzleRiskOutcomeRepository } from '../infrastructure/db/repositories/risk-outcome-repository.js';
import { NpcService } from '../application/npc/npc-service.js';
import { NpcRelationshipService } from '../application/npc/npc-relationship-service.js';
import { NpcTaskTargetResolver } from '../application/npc/npc-task-target-resolver.js';
import { DrizzleCitizenNpcRelationshipRepository } from '../infrastructure/db/repositories/citizen-npc-relationship-repository.js';
import {
  DrizzleCitizenLifeEvolutionRepository,
  DrizzleCitizenTemporalEventRepository,
} from '../infrastructure/db/repositories/citizen-life-evolution-repository.js';
import { CitizenLifeEvolutionService } from '../application/life/citizen-life-evolution-service.js';
import { LifeReviewService } from '../application/life/life-review-service.js';
import { FlashOpportunityService } from '../application/flash/flash-opportunity-service.js';
import {
  DrizzleFlashOpportunityRepository,
  DrizzleCitizenFlashSpawnStateRepository,
} from '../infrastructure/db/repositories/flash-opportunity-repository.js';
import { WorldClockService } from '../domain/time/world-clock-service.js';
import { AuthService } from '../application/auth/auth-service.js';
import { CitizenService } from '../application/citizen/citizen-service.js';
import { CitizenProfileService } from '../application/citizen/citizen-profile-service.js';
import { CitizenProgressionService } from '../application/citizen/citizen-progression-service.js';
import { WorldEventService } from '../application/world/world-event-service.js';
import { DrizzleWorldEventRepository } from '../infrastructure/db/repositories/world-event-repository.js';
import { StoryThreadService } from '../application/story/story-thread-service.js';
import { DrizzleStoryThreadRepository } from '../infrastructure/db/repositories/story-thread-repository.js';
import { TaskService } from '../application/task/task-service.js';
import { TaskInstanceMaterializer } from '../application/task/task-instance-materializer.js';
import { TaskSelectionService } from '../application/task/task-selection-service.js';
import { TaskFeedPhaseRefreshService } from '../application/task/task-feed-phase-refresh-service.js';
import {
  createElderlyOnlyPoolRegistry,
  type TaskPoolRegistry,
} from '../application/task/task-pool-registry.js';
import { HomeService } from '../application/home/home-service.js';
import { EconomyService } from '../application/economy/economy-service.js';
import { GameSurfaceService } from '../application/game-surface/game-surface-service.js';
import { DrizzleGameSurfaceRepository } from '../infrastructure/db/repositories/game-surface-repository.js';
import { RiskService } from '../application/risk/risk-service.js';
import { ApprovedContentLoader } from '../infrastructure/content/approved-content-loader.js';
import { correlationPlugin } from '../api/plugins/correlation-plugin.js';
import { errorHandlerPlugin } from '../api/plugins/error-handler-plugin.js';
import { createAuthPlugin } from '../api/plugins/auth-plugin.js';
import { createIdempotencyPlugin } from '../api/plugins/idempotency-plugin.js';
import { registerRoutes } from '../api/routes/index.js';
import { SESSION_COOKIE } from '../application/auth/auth-service.js';
import { DrizzleNpcPortraitAssignmentRepository } from '../infrastructure/db/repositories/npc-portrait-assignment-repository.js';
import { DrizzleCitizenCareerRepository } from '../infrastructure/db/repositories/citizen-career-repository.js';
import { AdminContextService } from '../application/admin/admin-context-service.js';
import { CitizenCareerService } from '../application/citizen/citizen-career-service.js';
import { CareerProgressionService } from '../application/citizen/career-progression-service.js';
import { DrizzleSocialGameplayRepository } from '../infrastructure/db/repositories/social-gameplay-repository.js';
import { SocialGameplayService } from '../application/social/social-gameplay-service.js';
import { AssetCatalogService } from '../application/dev/asset-catalog-service.js';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

export async function buildTestApp(options?: { poolRegistry?: TaskPoolRegistry }) {
  const appConfig = loadConfig();
  const { db, client } = createDatabase(appConfig.databaseUrl);

  try {
    const popupDismissSql = readFileSync(
      resolve(import.meta.dirname, '../../drizzle/0012_world_event_popup_dismiss.sql'),
      'utf8',
    );
    await client.unsafe(popupDismissSql);
  } catch {
    // Column may already exist or migration unavailable in partial schemas.
  }

  try {
    const taskFeedPhaseSql = readFileSync(
      resolve(import.meta.dirname, '../../drizzle/0017_citizen_task_feed_phase.sql'),
      'utf8',
    );
    await client.unsafe(taskFeedPhaseSql);
  } catch {
    // Column may already exist or migration unavailable in partial schemas.
  }

  try {
    const catalogMasterSql = readFileSync(
      resolve(import.meta.dirname, '../../drizzle/0018_marketplace_catalog_master.sql'),
      'utf8',
    );
    await client.unsafe(catalogMasterSql);
  } catch {
    // Catalog seed may already exist or migration unavailable in partial schemas.
  }

  try {
    const marketplaceAutomationSql = readFileSync(
      resolve(import.meta.dirname, '../../drizzle/0019_marketplace_automation.sql'),
      'utf8',
    );
    await client.unsafe(marketplaceAutomationSql);
  } catch {
    // Automation columns may already exist or migration unavailable in partial schemas.
  }

  try {
    const citizenPortraitSql = readFileSync(
      resolve(import.meta.dirname, '../../drizzle/0020_citizen_portrait_id.sql'),
      'utf8',
    );
    await client.unsafe(citizenPortraitSql);
  } catch {
    // Column may already exist or migration unavailable in partial schemas.
  }

  try {
    const npcPortraitSql = readFileSync(
      resolve(import.meta.dirname, '../../drizzle/0021_npc_portrait_assignments.sql'),
      'utf8',
    );
    await client.unsafe(npcPortraitSql);
  } catch {
    // Table may already exist or migration unavailable in partial schemas.
  }

  try {
    const careerProgressionSql = readFileSync(
      resolve(import.meta.dirname, '../../drizzle/0022_citizen_careers_and_progression_v2.sql'),
      'utf8',
    );
    await client.unsafe(careerProgressionSql);
  } catch {
    // Tables or migration steps may already exist in partial schemas.
  }

  try {
    const socialGameplaySql = readFileSync(
      resolve(import.meta.dirname, '../../drizzle/0023_social_gameplay_mega1.sql'),
      'utf8',
    );
    await client.unsafe(socialGameplaySql);
  } catch {
    // Tables or migration steps may already exist in partial schemas.
  }

  try {
    const worldEconomySql = readFileSync(
      resolve(import.meta.dirname, '../../drizzle/0024_mega2_world_economy.sql'),
      'utf8',
    );
    await client.unsafe(worldEconomySql);
  } catch {
    // Tables or migration steps may already exist in partial schemas.
  }

  const poolRegistry = options?.poolRegistry ?? createElderlyOnlyPoolRegistry();

  const worldClockRepo = new DrizzleWorldClockRepository(db);
  const sessionRepo = new DrizzleSessionRepository(db);
  const idempotencyRepo = new DrizzleIdempotencyRepository(db);
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
  const worldClockService = new WorldClockService(worldClockRepo);
  const worldEventRepo = new DrizzleWorldEventRepository(db);
  const storyThreadRepo = new DrizzleStoryThreadRepository(db);
  const storyThreadService = new StoryThreadService(storyThreadRepo, temporalEventRepo);
  const worldEventService = new WorldEventService(
    worldEventRepo,
    temporalEventRepo,
    storyThreadService,
  );
  const taskSelection = new TaskSelectionService(
    taskRepo,
    taskMaterializer,
    undefined,
    poolRegistry,
    undefined,
    citizenProfileService,
    npcRelationshipRepo,
    worldEventService,
    worldClockService,
    storyThreadService,
  );

  const authService = new AuthService(
    sessionRepo,
    appConfig.sessionTtlSeconds,
    new Set(['dev-admin-test']),
  );
  const economyService = new EconomyService(economyRepo);
  const gameSurfaceRepo = new DrizzleGameSurfaceRepository(db);
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
  const contentLoader = new ApprovedContentLoader(resolve(appConfig.contentRoot));

  const app = Fastify({ logger: false });
  await app.register(cookie, { secret: appConfig.sessionSecret });
  await app.register(correlationPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(createAuthPlugin(authService));
  await app.register(createIdempotencyPlugin(idempotencyRepo, appConfig.idempotencyTtlSeconds));

  const assetCatalogService = new AssetCatalogService();

  await registerRoutes(app, {
    worldClock: worldClockService,
    authService,
    contentLoader,
    enableDevAuth: true,
    googleOAuth: appConfig.googleOAuth,
    frontendOrigin: appConfig.googleOAuth?.frontendOrigin ?? appConfig.corsOrigin,
    contentCache: { result: null },
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
    assetCatalog: assetCatalogService,
  });

  await app.ready();

  return {
    app,
    citizenRepo,
    taskRepo,
    economyRepo,
    worldClockService,
    taskMaterializer,
    npcRelationshipService,
    citizenProgressionService,
    citizenCareerService,
    careerProgressionService,
    citizenCareerRepo,
    worldEventRepo,
    worldEventService,
    storyThreadRepo,
    storyThreadService,
    gameSurfaceRepo,
    gameSurfaceService,
    taskService,
    client,
    async close() {
      await app.close();
      await client.end();
    },
  };
}

export async function loginAs(app: Awaited<ReturnType<typeof buildTestApp>>['app'], accountId: string) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { devAccountId: accountId },
  });
  const cookie = response.cookies.find((c) => c.name === SESSION_COOKIE);
  return {
    statusCode: response.statusCode,
    body: response.json(),
    sessionCookie: cookie ? `${cookie.name}=${cookie.value}` : '',
  };
}

export async function loginAsAdmin(app: Awaited<ReturnType<typeof buildTestApp>>['app']) {
  return loginAs(app, 'dev-admin-test');
}

/** Admin routes require an authenticated admin with an existing citizen. */
export async function ensureAdminWithCitizen(app: TestAppInstance) {
  const admin = await loginAsAdmin(app);
  const created = await createCitizenViaApi(app, admin.sessionCookie, {
    displayName: 'Admin User',
    gender: 'male',
    age: 35,
  });
  if (created.statusCode !== 200 && created.statusCode !== 409) {
    throw new Error(`ensureAdminWithCitizen failed with status ${created.statusCode}`);
  }
  return admin;
}

export function withAdminSession(
  login: Awaited<ReturnType<typeof loginAs>>,
): Record<string, string> {
  return withSession(login.sessionCookie) as Record<string, string>;
}

export function withSession(sessionCookie: string) {
  return sessionCookie ? { cookie: sessionCookie } : {};
}

export function withIdempotency(key: string) {
  return { [IDEMPOTENCY_HEADER]: key };
}

export async function createCitizenViaApi(
  app: TestAppInstance,
  sessionCookie: string,
  payload: {
    displayName: string;
    gender: string;
    age: number;
    personality?: { sympathy: number; reputation: number; happiness: number };
  },
) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/citizens',
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload,
  });
  const body = response.json() as { citizenId: string; demoTaskInstanceId?: string };
  return {
    statusCode: response.statusCode,
    citizenId: body.citizenId,
    body,
  };
}

export type TestAppInstance = Awaited<ReturnType<typeof buildTestApp>>['app'];

export async function startStandardTask(
  app: TestAppInstance,
  sessionCookie: string,
  taskInstanceId: string,
) {
  return app.inject({
    method: 'POST',
    url: `/api/v1/tasks/${taskInstanceId}/start`,
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: {},
  });
}

export async function completeStandardTask(
  app: TestAppInstance,
  sessionCookie: string,
  taskInstanceId: string,
  optionId: string,
) {
  const started = await startStandardTask(app, sessionCookie, taskInstanceId);
  if (started.statusCode !== 200 && started.statusCode !== 409) {
    throw new Error(`startStandardTask failed with status ${started.statusCode}`);
  }

  let response = await app.inject({
    method: 'POST',
    url: `/api/v1/tasks/${taskInstanceId}/complete`,
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { optionId },
  });

  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (response.statusCode !== 200) {
      return response;
    }

    const body = response.json() as { taskWaiting?: boolean; status?: string };
    if (!body.taskWaiting && body.status !== 'waiting') {
      return response;
    }

    await new Promise((resolve) => setTimeout(resolve, 5));
    response = await app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${taskInstanceId}/complete`,
      headers: {
        ...withSession(sessionCookie),
        ...withIdempotency(randomUUID()),
      },
      payload: { optionId },
    });
  }

  return response;
}

export async function ensureGameSurfaceSchemaForTests(
  client: Awaited<ReturnType<typeof buildTestApp>>['client'],
) {
  const migrationSql = readFileSync(
    resolve(import.meta.dirname, '../../drizzle/0011_game_surface_v1.sql'),
    'utf8',
  );
  await client.unsafe(migrationSql);
  await client.unsafe(`
    INSERT INTO "marketplace_catalog" ("item_id", "name", "description", "category", "price_minor", "effect_key")
    VALUES ('item_test_affordable_v1', 'Gomitolo di spago', 'Per verifiche d''integrazione.', 'living', 50, null)
    ON CONFLICT ("item_id") DO NOTHING;
  `);

  const popupDismissSql = readFileSync(
    resolve(import.meta.dirname, '../../drizzle/0012_world_event_popup_dismiss.sql'),
    'utf8',
  );
  await client.unsafe(popupDismissSql);

  const jobsSql = readFileSync(
    resolve(import.meta.dirname, '../../drizzle/0013_game_surface_jobs_v1.sql'),
    'utf8',
  );
  await client.unsafe(jobsSql);

  const worldDepthSql = readFileSync(
    resolve(import.meta.dirname, '../../drizzle/0014_world_depth_expansion.sql'),
    'utf8',
  );
  await client.unsafe(worldDepthSql);

  const playerListingsSql = readFileSync(
    resolve(import.meta.dirname, '../../drizzle/0015_marketplace_player_listings.sql'),
    'utf8',
  );
  await client.unsafe(playerListingsSql);

  const rentalsSql = readFileSync(
    resolve(import.meta.dirname, '../../drizzle/0016_citizen_rentals.sql'),
    'utf8',
  );
  await client.unsafe(rentalsSql);
}

export async function ensureStoryThreadsSchemaForTests(
  client: Awaited<ReturnType<typeof buildTestApp>>['client'],
) {
  const migrationSql = readFileSync(
    resolve(import.meta.dirname, '../../drizzle/0010_story_threads_v1.sql'),
    'utf8',
  );
  await client.unsafe(migrationSql);
}
