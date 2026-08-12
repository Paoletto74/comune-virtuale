import { randomUUID } from 'node:crypto';
import type {
  CitizenRepository,
  CitizenTemporalEventRepository,
  GameSurfaceRepository,
  ReferendumRecord,
  WorldEventRepository,
} from '../../domain/ports/repositories.js';
import type { EconomyService, BalanceSummaryDto } from '../economy/economy-service.js';
import type { CitizenProfileService } from '../citizen/citizen-profile-service.js';
import type { CitizenProgressionService } from '../citizen/citizen-progression-service.js';
import type { CitizenCareerService } from '../citizen/citizen-career-service.js';
import type { CitizenLifeEvolutionService } from '../life/citizen-life-evolution-service.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';
import { personalValuesFromPartial, PERSONAL_VALUE_KEYS, PERSONAL_VALUE_LABELS } from '../../slice/personal-values-constants.js';
import {
  DEFAULT_INFLATION_RATE_BPS,
  GAME_SURFACE_DEMO_REFERENDUM_DURATION_MS,
  GAME_SURFACE_GIFT_REASON,
  GAME_SURFACE_GIFT_TRANSACTION_TYPE,
  GAME_SURFACE_LOAN_REASON,
  GAME_SURFACE_LOAN_TRANSACTION_TYPE,
  GAME_SURFACE_MARKETPLACE_REASON,
  GAME_SURFACE_MARKETPLACE_TRANSACTION_CLASS,
  GAME_SURFACE_MARKETPLACE_TRANSACTION_TYPE,
  GAME_SURFACE_PAYROLL_REASON,
  GAME_SURFACE_PAYROLL_TRANSACTION_TYPE,
  citizenGiftIdempotencyKey,
  citizenLoanIdempotencyKey,
  citizenMessageIdempotencyKey,
  demoReferendumIdempotencyKey,
  economicSnapshotIdempotencyKey,
  GAME_SURFACE_WORK_SHIFT_DURATION_MS,
  inflationSnapshotIdempotencyKey,
  JOB_APPLICATION_ACCEPT_PROBABILITY,
  jobApplicationIdempotencyKey,
  jobAcceptIdempotencyKey,
  jobClockInIdempotencyKey,
  marketplacePurchaseIdempotencyKey,
  marketplacePurchaseSourceActionId,
  referendumVoteIdempotencyKey,
} from '../../slice/game-surface-constants.js';
import {
  enrichReferendumTemplate,
  jobPayrollIdempotencyKey,
  municipalityChronicleIdempotencyKey,
  pickChronicleTemplate,
  pickReferendumTemplate,
  REFERENDUM_TEMPLATES,
  shiftPayMinor,
} from '../../slice/world-depth-constants.js';
import {
  expandGazzettaArticle,
  GAZZETTA_MAX_ARTICLES,
  GAZZETTA_MIN_ARTICLES,
  gazzettaRefreshIdempotencyKey,
  gazzettaHeroImageKey,
  pickGazzettaFillerTemplate,
} from '../../slice/gazzetta-constants.js';
import { getJobRequirements, meetsJobRequirements } from '../../slice/job-requirements-constants.js';
import {
  getJobCatalogEntry,
  pickDailyJobOffers,
  type JobCatalogEntry,
} from '../../slice/job-catalog-constants.js';
import {
  getCatalogItemDef,
  mapLegacyCategoryToCanonical,
  MARKETPLACE_CATEGORY_LABELS,
  MARKETPLACE_CATEGORY_ORDER,
  type MarketplaceCategoryId,
} from '../../slice/marketplace-catalog-constants.js';
import {
  buildSimulatedPlayerListings,
  marketplaceRotationDayKey,
  pickDailyCategoryItems,
} from '../../slice/marketplace-rotation.js';
import { isConsumableItem, isFoodItem, isRentableCategory, MARKETPLACE_RENT_DURATION_MS, monthlyRentPriceMinor, usedListingPriceMinor } from '../../slice/marketplace-item-meta.js';
import type { MarketplaceCatalogItemDef } from '../../slice/marketplace-catalog-constants.js';
import { evaluatePurchaseRequirement } from '../../slice/product-requirement-resolver.js';
import {
  npcPriorityWaitGameMs,
  rentedPropertySaleRefundMinor,
} from '../../slice/marketplace-pricing.js';
import {
  assetCurrentValueMinor,
  dynamicCatalogPriceMinor,
} from '../../slice/marketplace-dynamic-pricing.js';
import { buildCitizenRecurringFlows, netRecurringFlowMinor } from '../../slice/citizen-recurring-flows.js';
import { computePurchasingPower } from '../../slice/purchasing-power.js';
import {
  BASE_PRICE_INDEX_BPS,
  evolveWorldInflation,
  INFLATION_TICK_INTERVAL_MS,
} from '../../slice/world-inflation-engine.js';
import {
  marketplaceNpcDisplayName,
  marketplaceNpcTemplateRef,
  pickMarketplaceNpcTemplateId,
} from '../../slice/marketplace-npc-resolver.js';
import { SLICE_GAME_CURRENCY_ID, SLICE_TRANSFER_TRANSACTION_CLASS } from '../../slice/economy-constants.js';
import { OCCUPATION_LABELS } from '../../slice/citizen-profile-constants.js';
import { isGameSurfaceStorageUnavailableError } from '../../infrastructure/db/repositories/game-surface-repository.js';
import type { DrizzleNpcPortraitAssignmentRepository } from '../../infrastructure/db/repositories/npc-portrait-assignment-repository.js';
import {
  getMunicipalityCitizenProfiles,
  getMunicipalityCitizensDirectory,
  getMunicipalityPopulationCount,
  getMunicipalityPovertyRankings,
  getMunicipalityReputationRankings,
  getMunicipalitySympathyRankings,
  getMunicipalityWealthRankings,
} from '../../slice/municipality-citizen-profiles.js';
import { deterministicChance } from '../../domain/flash/deterministic-flash-random.js';
import {
  canClockInToJob,
  gameDayStartMs,
  remainingShiftMs,
  resolveJobOfferUiStatus,
  syncJobEngagementState,
} from './job-engagement-sync.js';
import type {
  AcceptJobResultDto,
  ApplyJobResultDto,
  ClockInJobResultDto,
  CitizenDirectoryEntryDto,
  CitizensDirectoryDto,
  CitizenEmploymentDto,
  EconomicSnapshotDto,
  GazzettaArticleDto,
  GazzettaFeedDto,
  GiftCashResultDto,
  JobOffersFeedDto,
  JobOfferDto,
  LoanCashResultDto,
  MarketplaceFeedDto,
  MarketplaceCategoryFeedDto,
  MarketplaceItemDto,
  MunicipalityOverviewDto,
  NotificationDto,
  NotificationsFeedDto,
  ProfileDetailDto,
  PublicProfileDto,
  PurchaseItemResultDto,
  SellItemResultDto,
  RankingEntryDto,
  RankingsDto,
  ReferendumDto,
  ReferendumsFeedDto,
  SendMessageResultDto,
  VoteReferendumResultDto,
  NotificationScope,
} from './game-surface-types.js';

const PERSONAL_NOTIFICATION_TYPES = new Set([
  'level_up',
  'life_review',
  'life_update',
  'milestone',
  'job_application',
  'job_payroll',
  'marketplace_purchase',
  'marketplace_sale',
]);

function extractWorldEventId(payload: Record<string, unknown>): string | null {
  const worldEventId = payload.worldEventId;
  return typeof worldEventId === 'string' && worldEventId.length > 0 ? worldEventId : null;
}

function isPublicMilestone(payload: Record<string, unknown>): boolean {
  const audience = payload.audience;
  return audience === 'public' || audience === 'global' || payload.public === true;
}

async function resolveCitizenMainLevel(
  citizens: { getProgression(citizenId: string): Promise<{ mainLevel?: number } | null> },
  citizenId: string,
): Promise<number> {
  const progression = await citizens.getProgression(citizenId);
  return progression?.mainLevel ?? 1;
}

function toRankingEntries(rows: Array<{ citizenId: string; displayName: string; value: number }>): RankingEntryDto[] {
  return rows.map((row, index) => ({
    rank: index + 1,
    citizenId: row.citizenId,
    displayName: row.displayName,
    value: row.value,
  }));
}

function mapReferendum(
  record: ReferendumRecord,
  userVote?: 'a' | 'b',
  gameTimeMs?: number,
  template?: (typeof REFERENDUM_TEMPLATES)[number],
): ReferendumDto {
  const remainingMs =
    record.status === 'active' && gameTimeMs != null
      ? Math.max(0, record.endsAtGameMs - gameTimeMs)
      : undefined;
  const enrichment = template ? enrichReferendumTemplate(template) : undefined;
  return {
    referendumId: record.referendumId,
    question: record.question,
    context: record.context,
    ...(enrichment ?? {}),
    heroImageKey: template ? `referendum-${template.templateId}` : 'referendum-default',
    status: record.status as ReferendumDto['status'],
    options: [
      { optionId: 'a', label: record.optionALabel, votes: record.optionAVotes },
      { optionId: 'b', label: record.optionBLabel, votes: record.optionBVotes },
    ],
    startsAtGameMs: record.startsAtGameMs,
    endsAtGameMs: record.endsAtGameMs,
    ...(remainingMs != null ? { remainingMs } : {}),
    closedAtGameMs: record.closedAtGameMs ?? undefined,
    winningOption: record.winningOption ?? undefined,
    consequenceSummary: record.consequenceSummary ?? undefined,
    userVote,
  };
}

function resolveJobRequirementsForOffer(offerId: string): JobOfferDto['requirements'] | undefined {
  const catalog = getJobCatalogEntry(offerId);
  const legacy = getJobRequirements(offerId);
  const req = catalog?.requirements ?? legacy;
  if (!req && !catalog?.minMainLevel) return undefined;
  return {
    ...(req ?? {}),
    ...(catalog?.minMainLevel != null ? { mainLevel: catalog.minMainLevel } : {}),
  };
}

function evaluateJobBlocked(
  offerId: string,
  stats: Partial<Record<(typeof PERSONAL_VALUE_KEYS)[number], number>>,
  mainLevel: number,
): { blocked: boolean; blockReason?: string } {
  const catalog = getJobCatalogEntry(offerId);
  const requirements = resolveJobRequirementsForOffer(offerId);
  if (!requirements) return { blocked: false };

  const missing: string[] = [];
  for (const key of PERSONAL_VALUE_KEYS) {
    const required = requirements[key as (typeof PERSONAL_VALUE_KEYS)[number]];
    if (required == null) continue;
    const current = stats[key as (typeof PERSONAL_VALUE_KEYS)[number]] ?? 0;
    if (current < required) {
      missing.push(`${PERSONAL_VALUE_LABELS[key as (typeof PERSONAL_VALUE_KEYS)[number]]} ${required}`);
    }
  }
  if (requirements.mainLevel != null && mainLevel < requirements.mainLevel) {
    missing.push(`Livello ${requirements.mainLevel}`);
  }

  if (missing.length === 0) return { blocked: false };
  return {
    blocked: true,
    blockReason: catalog?.tier === 'high' ? `Requisiti: ${missing.join(', ')}` : missing.join(' · '),
  };
}

function toMarketplaceItemDto(input: {
  itemId: string;
  name: string;
  description: string;
  categoryId: MarketplaceCategoryId;
  priceMinor: bigint;
  imageKey: string;
  imagePath?: string;
  slug?: string;
  subcategory?: string;
  economicTier?: string;
  essential?: string;
  ownedCount: number;
  possessionStatus?: 'available' | 'owned' | 'rented';
  rentExpiresAtGameMs?: number;
  remainingRentMs?: number;
  isShowcase?: boolean;
  isPlayerListing?: boolean;
  sellerName?: string;
  listingType?: 'sale' | 'rent';
  listingId?: string;
  purchaseBlocked?: boolean;
  purchaseBlockReason?: string;
  minMainLevelRequired?: number;
  catalogBasePriceMinor?: bigint;
  currentValueMinor?: bigint;
  purchasePriceMinor?: bigint;
}): MarketplaceItemDto {
  return {
    itemId: input.itemId,
    name: input.name,
    description: input.description,
    categoryId: input.categoryId,
    category: input.categoryId,
    priceMinor: input.priceMinor.toString(),
    owned: input.ownedCount > 0,
    ownedCount: input.ownedCount,
    ...(input.possessionStatus ? { possessionStatus: input.possessionStatus } : {}),
    ...(input.rentExpiresAtGameMs != null ? { rentExpiresAtGameMs: input.rentExpiresAtGameMs } : {}),
    ...(input.remainingRentMs != null ? { remainingRentMs: input.remainingRentMs } : {}),
    imageKey: input.imageKey,
    ...(input.imagePath ? { imagePath: input.imagePath } : {}),
    ...(input.slug ? { slug: input.slug } : {}),
    ...(input.subcategory ? { subcategory: input.subcategory } : {}),
    ...(input.economicTier ? { economicTier: input.economicTier } : {}),
    essential: input.essential,
    isShowcase: input.isShowcase,
    isPlayerListing: input.isPlayerListing,
    sellerName: input.sellerName,
    listingType: input.listingType,
    listingId: input.listingId,
    ...(input.purchaseBlocked ? { purchaseBlocked: true } : {}),
    ...(input.purchaseBlockReason ? { purchaseBlockReason: input.purchaseBlockReason } : {}),
    ...(input.minMainLevelRequired != null
      ? { minMainLevelRequired: input.minMainLevelRequired }
      : {}),
    ...(input.catalogBasePriceMinor != null
      ? { catalogBasePriceMinor: input.catalogBasePriceMinor.toString() }
      : {}),
    ...(input.currentValueMinor != null
      ? { currentValueMinor: input.currentValueMinor.toString() }
      : {}),
    ...(input.purchasePriceMinor != null
      ? { purchasePriceMinor: input.purchasePriceMinor.toString() }
      : {}),
  };
}

export class GameSurfaceService {
  constructor(
    private readonly gameSurface: GameSurfaceRepository,
    private readonly temporalEvents: CitizenTemporalEventRepository,
    private readonly economy: EconomyService,
    private readonly citizens: CitizenRepository,
    private readonly worldEvents: WorldEventRepository,
    private readonly lifeEvolution?: CitizenLifeEvolutionService,
    private readonly profile?: CitizenProfileService,
    private readonly npcPortraitAssignments?: DrizzleNpcPortraitAssignmentRepository,
    private readonly progression?: CitizenProgressionService,
    private readonly career?: CitizenCareerService,
  ) {}

  private isEnabled(): boolean {
    return this.gameSurface.isStorageAvailable();
  }

  private disabledFeed<T extends { enabled: boolean }>(payload: Omit<T, 'enabled'> & Partial<T>): T {
    return { enabled: false, ...payload } as T;
  }

  private async resolveJobOffer(offerId: string): Promise<{
    offerId: string;
    title: string;
    employer: string;
    description: string;
    occupationCode: number;
    salaryHintMinor: bigint;
    enabled: boolean;
  } | null> {
    const dbOffer = await this.gameSurface.findJobOffer(offerId);
    if (dbOffer?.enabled) {
      return dbOffer;
    }
    const catalog = getJobCatalogEntry(offerId);
    if (!catalog || catalog.enabled === false) return null;
    return {
      offerId: catalog.offerId,
      title: catalog.title,
      employer: catalog.employer,
      description: catalog.description,
      occupationCode: catalog.occupationCode,
      salaryHintMinor: catalog.salaryHintMinor,
      enabled: true,
    };
  }

  async getGazzettaArticles(citizenId: string, gameTimeMs: number): Promise<GazzettaFeedDto> {
    if (!this.isEnabled()) {
      return this.disabledFeed<GazzettaFeedDto>({ articles: [] });
    }

    try {
      await this.ensureGazzettaRefresh(gameTimeMs);
      await this.simulateAutonomousCitizenActivity(gameTimeMs);

      const articles: GazzettaArticleDto[] = [];
      const seenArticleIds = new Set<string>();

      const pushArticle = (article: GazzettaArticleDto) => {
        if (seenArticleIds.has(article.articleId)) return;
        seenArticleIds.add(article.articleId);
        articles.push(article);
      };

      const events = await this.temporalEvents.listRecentByCitizen(citizenId, 50);
      const seenWorldEventIds = new Set<string>();

      for (const event of events) {
        if (event.eventType === 'city_update') {
          const worldEventId = extractWorldEventId(event.payload);
          if (worldEventId) {
            if (seenWorldEventIds.has(worldEventId)) continue;
            seenWorldEventIds.add(worldEventId);
          }

          const articleId = worldEventId ?? event.eventId;
          const expanded = expandGazzettaArticle({
            title: event.title ?? 'Aggiornamento di città',
            body: event.body ?? '',
            category: 'city',
            gameTimeMs: event.worldTimeMs,
            articleId,
          });
          pushArticle({
            articleId,
            source: 'temporal_event',
            title: event.title ?? 'Aggiornamento di città',
            summary: expanded.summary,
            body: expanded.summary,
            fullBody: expanded.fullBody,
            comuneLine: expanded.comuneLine,
            publishedAtGameMs: event.worldTimeMs,
            category: 'city',
            heroImageKey: gazzettaHeroImageKey('city'),
          });
          continue;
        }

        if (event.eventType === 'milestone' && isPublicMilestone(event.payload)) {
          const expanded = expandGazzettaArticle({
            title: event.title ?? 'Cronaca comunale',
            body: event.body ?? '',
            category: 'milestone',
            gameTimeMs: event.worldTimeMs,
            articleId: event.eventId,
          });
          pushArticle({
            articleId: event.eventId,
            source: 'temporal_event',
            title: event.title ?? 'Cronaca comunale',
            summary: expanded.summary,
            body: expanded.summary,
            fullBody: expanded.fullBody,
            comuneLine: expanded.comuneLine,
            publishedAtGameMs: event.worldTimeMs,
            category: 'milestone',
            heroImageKey: gazzettaHeroImageKey('milestone'),
          });
          continue;
        }

        if (event.eventType === 'marketplace_purchase' && isPublicMilestone(event.payload)) {
          const expanded = expandGazzettaArticle({
            title: event.title ?? 'Economia',
            body: event.body ?? '',
            category: 'economy',
            gameTimeMs: event.worldTimeMs,
            articleId: event.eventId,
          });
          pushArticle({
            articleId: event.eventId,
            source: 'temporal_event',
            title: event.title ?? 'Economia',
            summary: expanded.summary,
            body: expanded.summary,
            fullBody: expanded.fullBody,
            comuneLine: expanded.comuneLine,
            publishedAtGameMs: event.worldTimeMs,
            category: 'economy',
            heroImageKey: gazzettaHeroImageKey('economy'),
          });
        }
      }

      const chronicleEntries = await this.gameSurface.listChronicleEntries(24);
      for (const entry of chronicleEntries) {
        const expanded = expandGazzettaArticle({
          title: entry.title,
          body: entry.body,
          category: entry.category,
          gameTimeMs: entry.recordedAtGameMs,
          articleId: entry.entryId,
        });
        pushArticle({
          articleId: entry.entryId,
          source: 'temporal_event',
          title: entry.title,
          summary: expanded.summary,
          body: expanded.summary,
          fullBody: expanded.fullBody,
          comuneLine: expanded.comuneLine,
          publishedAtGameMs: entry.recordedAtGameMs,
          category: entry.category,
          heroImageKey: gazzettaHeroImageKey(entry.category),
        });
      }

      const closedReferendums = await this.gameSurface.listClosedReferendums(8);
      for (const referendum of closedReferendums) {
        const expanded = expandGazzettaArticle({
          title: referendum.question,
          body: referendum.consequenceSummary ?? referendum.context,
          category: 'referendum',
          gameTimeMs: referendum.closedAtGameMs ?? referendum.endsAtGameMs,
          articleId: referendum.referendumId,
          consequenceLine: referendum.consequenceSummary ?? undefined,
        });
        pushArticle({
          articleId: referendum.referendumId,
          source: 'referendum',
          title: referendum.question,
          summary: expanded.summary,
          body: expanded.summary,
          fullBody: expanded.fullBody,
          comuneLine: expanded.comuneLine,
          publishedAtGameMs: referendum.closedAtGameMs ?? referendum.endsAtGameMs,
          category: 'referendum',
          heroImageKey: gazzettaHeroImageKey('referendum'),
        });
      }

      let fillerIndex = 0;
      while (articles.length < GAZZETTA_MIN_ARTICLES) {
        const template = pickGazzettaFillerTemplate(gameTimeMs, fillerIndex);
        const articleId = `gazzetta-filler:${template.templateId}:${Math.floor(gameTimeMs / (5 * 60 * 1000))}:${fillerIndex}`;
        if (!seenArticleIds.has(articleId)) {
          const expanded = expandGazzettaArticle({
            title: template.title,
            body: template.body,
            category: template.category,
            gameTimeMs,
            articleId,
          });
          pushArticle({
            articleId,
            source: 'temporal_event',
            title: template.title,
            summary: expanded.summary,
            body: expanded.summary,
            fullBody: expanded.fullBody,
            comuneLine: expanded.comuneLine,
            publishedAtGameMs: gameTimeMs - fillerIndex * 60_000,
            category: template.category,
            heroImageKey: gazzettaHeroImageKey(template.category),
          });
        }
        fillerIndex += 1;
        if (fillerIndex > 20) break;
      }

      articles.sort((a, b) => b.publishedAtGameMs - a.publishedAtGameMs);
      return { enabled: true, articles: articles.slice(0, GAZZETTA_MAX_ARTICLES) };
    } catch (error) {
      if (isGameSurfaceStorageUnavailableError(error)) {
        return this.disabledFeed<GazzettaFeedDto>({ articles: [] });
      }
      throw error;
    }
  }

  private async ensureGazzettaRefresh(gameTimeMs: number): Promise<void> {
    const template = pickChronicleTemplate(gameTimeMs);
    const refreshKey = gazzettaRefreshIdempotencyKey(gameTimeMs);
    await this.gameSurface.recordChronicleEntry({
      entryId: randomUUID(),
      recordedAtGameMs: gameTimeMs,
      category: template.category,
      title: template.title,
      body: template.body,
      idempotencyKey: refreshKey,
    });
  }

  private async simulateAutonomousCitizenActivity(gameTimeMs: number): Promise<void> {
    const citizens = getMunicipalityCitizenProfiles(gameTimeMs);
    if (citizens.length === 0) return;

    const bucket = Math.floor(gameTimeMs / (5 * 60 * 1000));
    const citizen = citizens[bucket % citizens.length];
    if (!citizen) return;

    const scenarios = [
      {
        title: `${citizen.displayName} cambia ranking`,
        body: `Un cittadino autonomo ha modificato la propria posizione nei ranking. Nessuno ha chiesto spiegazioni.`,
        category: 'cronaca',
      },
      {
        title: 'Acquisto in città',
        body: `${citizen.displayName} ha effettuato un acquisto. Il mercato registra. Il mercato approva.`,
        category: 'economia',
      },
      {
        title: 'Voto registrato',
        body: `${citizen.displayName} ha partecipato a un referendum. La democrazia locale ha un altro dato da archiviare.`,
        category: 'politica',
      },
    ];
    const scenario = scenarios[bucket % scenarios.length]!;

    await this.gameSurface.recordChronicleEntry({
      entryId: randomUUID(),
      recordedAtGameMs: gameTimeMs,
      category: scenario.category,
      title: scenario.title,
      body: scenario.body,
      idempotencyKey: `autonomous-citizen:${citizen.citizenId}:${bucket}`,
    });
  }

  async getNotifications(
    citizenId: string,
    scope: NotificationScope,
    _gameTimeMs: number,
  ): Promise<NotificationsFeedDto> {
    if (!this.isEnabled()) {
      return this.disabledFeed<NotificationsFeedDto>({ scope, notifications: [] });
    }

    const notifications: NotificationDto[] = [];

    if (scope === 'personal') {
      const events = await this.temporalEvents.listRecentByCitizen(citizenId, 50);
      for (const event of events) {
        const isFlashOutcome =
          event.idempotencyKey.startsWith('progression:flash:') ||
          (event.payload.sourceType as string | undefined) === 'flash_opportunity';

        if (PERSONAL_NOTIFICATION_TYPES.has(event.eventType) || isFlashOutcome) {
          notifications.push({
            notificationId: event.eventId,
            scope,
            type: isFlashOutcome ? 'flash_outcome' : event.eventType,
            title: event.title ?? 'Notifica',
            body: event.body ?? '',
            worldTimeMs: event.worldTimeMs,
          });
        }
      }
    } else {
      const events = await this.temporalEvents.listRecentByCitizen(citizenId, 50);
      const seenWorldEventIds = new Set<string>();

      for (const event of events) {
        if (event.eventType !== 'city_update') continue;

        const worldEventId = extractWorldEventId(event.payload);
        if (!worldEventId || seenWorldEventIds.has(worldEventId)) continue;
        seenWorldEventIds.add(worldEventId);

        notifications.push({
          notificationId: worldEventId,
          scope,
          type: `world_${(event.payload.type as string | undefined) ?? 'event'}`,
          title: event.title ?? 'Evento del Comune',
          body: event.body ?? '',
          worldTimeMs: event.worldTimeMs,
        });
      }
    }

    notifications.sort((a, b) => b.worldTimeMs - a.worldTimeMs);

    return { enabled: true, scope, notifications };
  }

  async getReferendums(citizenId: string, gameTimeMs: number): Promise<ReferendumsFeedDto> {
    if (!this.isEnabled()) {
      return this.disabledFeed<ReferendumsFeedDto>({ referendums: [] });
    }

    await this.ensureActiveReferendum(gameTimeMs);
    await this.closeExpiredReferendums(gameTimeMs);

    const records = await this.gameSurface.listReferendums();
    const referendums: ReferendumDto[] = [];

    for (const record of records) {
      const vote = await this.gameSurface.findVoteByCitizen(record.referendumId, citizenId);
      const template = this.resolveReferendumTemplate(record);
      referendums.push(
        mapReferendum(record, vote?.optionId as 'a' | 'b' | undefined, gameTimeMs, template),
      );
    }

    return { enabled: true, referendums };
  }

  async voteReferendum(input: {
    citizenId: string;
    referendumId: string;
    optionId: 'a' | 'b';
    gameTimeMs: number;
  }): Promise<VoteReferendumResultDto> {
    if (!this.isEnabled()) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    await this.ensureActiveReferendum(input.gameTimeMs);
    await this.closeExpiredReferendums(input.gameTimeMs);

    const referendum = await this.gameSurface.findReferendumById(input.referendumId);
    if (!referendum || referendum.status !== 'active') {
      throw new AppError('NOT_FOUND', 'REFERENDUM_NOT_FOUND', 'error.game_surface.referendum_not_found');
    }

    if (input.gameTimeMs < referendum.startsAtGameMs || input.gameTimeMs > referendum.endsAtGameMs) {
      throw new AppError('CONFLICT', 'REFERENDUM_CLOSED', 'error.game_surface.referendum_closed');
    }

    const idempotencyKey = referendumVoteIdempotencyKey(input.referendumId, input.citizenId);
    const result = await this.gameSurface.recordReferendumVote({
      voteId: randomUUID(),
      referendumId: input.referendumId,
      citizenId: input.citizenId,
      optionId: input.optionId,
      votedAtGameMs: input.gameTimeMs,
      idempotencyKey,
    });

    if (!result) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    if (result.created) {
      await this.gameSurface.incrementReferendumVote(input.referendumId, input.optionId);
      if (this.progression) {
        await this.progression.grantForReferendumVote({
          citizenId: input.citizenId,
          referendumId: input.referendumId,
          worldTimeMs: input.gameTimeMs,
        });
      }
    }

    const referendums = (await this.getReferendums(input.citizenId, input.gameTimeMs)).referendums;

    return {
      referendumId: input.referendumId,
      optionId: input.optionId,
      duplicate: !result.created,
      referendums,
    };
  }

  async getMarketplace(citizenId: string, gameTimeMs = Date.now()): Promise<MarketplaceFeedDto> {
    if (!this.isEnabled()) {
      return this.disabledFeed<MarketplaceFeedDto>({ items: [], categories: [], rotationDayKey: 0 });
    }

    await this.gameSurface.expireRentalsBefore(gameTimeMs);
    await this.processNpcListingResolutions(gameTimeMs);
    const { priceIndexBps } = await this.ensureWorldEconomy(gameTimeMs);

    const progression = await this.citizens.getProgression(citizenId);
    const mainLevel = progression?.mainLevel ?? 1;

    const inventory = await this.gameSurface.listInventoryByCitizen(citizenId);
    const ownedCounts = new Map<string, number>();
    for (const entry of inventory) {
      ownedCounts.set(entry.itemId, (ownedCounts.get(entry.itemId) ?? 0) + 1);
    }
    const activeRentals = await this.gameSurface.listActiveRentalsByTenant(citizenId);
    const rentedByItem = new Map(
      activeRentals.map((rental) => [
        rental.itemId,
        {
          expiresAtGameMs: rental.expiresAtGameMs,
          remainingMs: Math.max(0, rental.expiresAtGameMs - gameTimeMs),
        },
      ]),
    );

    const itemPossession = (itemId: string, _categoryId: MarketplaceCategoryId) => {
      const count = ownedCounts.get(itemId) ?? 0;
      const rental = rentedByItem.get(itemId);
      if (rental) {
        return {
          ownedCount: count,
          possessionStatus: 'rented' as const,
          rentExpiresAtGameMs: rental.expiresAtGameMs,
          remainingRentMs: rental.remainingMs,
        };
      }
      if (count > 0) {
        return { ownedCount: count, possessionStatus: 'owned' as const };
      }
      return { ownedCount: 0, possessionStatus: 'available' as const };
    };

    const purchaseMeta = (def: Pick<MarketplaceCatalogItemDef, 'economicTier'>) => {
      const gate = evaluatePurchaseRequirement(def, mainLevel);
      return gate.blocked
        ? {
            purchaseBlocked: true,
            purchaseBlockReason: gate.blockReason,
            minMainLevelRequired: gate.minMainLevel,
          }
        : {};
    };

    const playerListings = await this.gameSurface.listActivePlayerListings();
    const sellerNames = new Map<string, string>();
    const dbItems = await this.gameSurface.listMarketplaceItems();
    const dbPriceById = new Map(
      dbItems.map((item) => [
        item.itemId,
        dynamicCatalogPriceMinor(item.priceMinor, priceIndexBps),
      ]),
    );

    const categories: MarketplaceCategoryFeedDto[] = MARKETPLACE_CATEGORY_ORDER.map((categoryId) => {
      const dailyItems = pickDailyCategoryItems(categoryId, gameTimeMs);
      const realListings = playerListings.filter((listing) => {
        const def = getCatalogItemDef(listing.itemId);
        return (def?.categoryId ?? mapLegacyCategoryToCanonical('', listing.itemId)) === categoryId;
      });
      const simulatedListings = buildSimulatedPlayerListings(gameTimeMs).filter(
        (listing) => listing.categoryId === categoryId,
      );

      const showcase: MarketplaceItemDto[] = [
        ...realListings.map((listing) => {
          const def = getCatalogItemDef(listing.itemId);
          const possession = itemPossession(listing.itemId, categoryId);
          return toMarketplaceItemDto({
            itemId: listing.itemId,
            name: def?.name ?? listing.itemId,
            description: def?.description ?? 'In vendita da un cittadino.',
            categoryId,
            priceMinor: listing.priceMinor,
            imageKey: def?.imageKey ?? 'luxury',
            essential: 'Usato',
            ...possession,
            isShowcase: true,
            isPlayerListing: true,
            sellerName: sellerNames.get(listing.sellerCitizenId) ?? 'Giocatore',
            listingType: listing.listingType,
            listingId: listing.listingId,
          });
        }),
        ...simulatedListings.map((listing) => {
          const def = getCatalogItemDef(listing.itemId);
          const possession = itemPossession(listing.itemId, categoryId);
          return toMarketplaceItemDto({
            itemId: listing.itemId,
            name: def?.name ?? listing.itemId,
            description: def?.description ?? 'In vendita da un cittadino.',
            categoryId,
            priceMinor: listing.priceMinor,
            imageKey: def?.imageKey ?? 'luxury',
            essential: listing.listingType === 'rent' ? 'Affitto' : 'Usato',
            ...possession,
            isShowcase: true,
            isPlayerListing: true,
            sellerName: listing.sellerName,
            listingType: listing.listingType,
            listingId: listing.listingId,
          });
        }),
      ];

      const items: MarketplaceItemDto[] = dailyItems.map((def) => {
        const possession = itemPossession(def.itemId, def.categoryId);
        return toMarketplaceItemDto({
          itemId: def.itemId,
          name: def.name,
          description: def.description,
          categoryId: def.categoryId,
          priceMinor: dbPriceById.get(def.itemId) ?? dynamicCatalogPriceMinor(def.priceMinor, priceIndexBps),
          imageKey: def.imageKey,
          imagePath: def.imagePath,
          slug: def.slug,
          subcategory: def.subcategory,
          economicTier: def.economicTier,
          essential: def.essential,
          catalogBasePriceMinor: def.priceMinor,
          ...possession,
          ...purchaseMeta(def),
        });
      });

      return {
        categoryId,
        label: MARKETPLACE_CATEGORY_LABELS[categoryId],
        showcase,
        items,
      };
    });

    const flatItems = categories.flatMap((category) => category.items);

    return {
      enabled: true,
      items: flatItems,
      categories,
      rotationDayKey: marketplaceRotationDayKey(gameTimeMs),
    };
  }

  private async resolvePurchasableItem(itemId: string): Promise<{
    itemId: string;
    name: string;
    priceMinor: bigint;
    enabled: boolean;
  } | null> {
    const dbItem = await this.gameSurface.findMarketplaceItem(itemId);
    if (dbItem?.enabled) {
      return dbItem;
    }
    const def = getCatalogItemDef(itemId);
    if (!def) return null;
    return {
      itemId: def.itemId,
      name: def.name,
      priceMinor: def.priceMinor,
      enabled: true,
    };
  }

  async purchaseItem(input: {
    citizenId: string;
    itemId: string;
    gameTimeMs: number;
    correlationId?: string;
  }): Promise<PurchaseItemResultDto> {
    if (!this.isEnabled()) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    const item = await this.resolvePurchasableItem(input.itemId);
    if (!item || !item.enabled) {
      throw new AppError('NOT_FOUND', 'MARKETPLACE_ITEM_NOT_FOUND', 'error.game_surface.item_not_found');
    }

    const { priceIndexBps } = await this.ensureWorldEconomy(input.gameTimeMs);
    const purchasePriceMinor = dynamicCatalogPriceMinor(item.priceMinor, priceIndexBps);

    const catalogDef = getCatalogItemDef(input.itemId);
    if (catalogDef) {
      const progression = await this.citizens.getProgression(input.citizenId);
      const mainLevel = progression?.mainLevel ?? 1;
      const gate = evaluatePurchaseRequirement(catalogDef, mainLevel);
      if (gate.blocked) {
        throw new AppError(
          'CONFLICT',
          'MARKETPLACE_PURCHASE_BLOCKED',
          'error.game_surface.purchase_blocked',
        );
      }
    }

    const idempotencyKey = marketplacePurchaseIdempotencyKey(input.citizenId, input.itemId);
    const existingInventory = await this.gameSurface.findInventoryByIdempotencyKey(idempotencyKey);
    if (existingInventory) {
      const balance = await this.economy.getBalance(input.citizenId);
      const marketplace = await this.getMarketplace(input.citizenId, input.gameTimeMs);
      return {
        itemId: input.itemId,
        inventoryId: existingInventory.inventoryId,
        duplicate: true,
        balance,
        marketplace,
      };
    }

    await this.economy.applyCashDelta({
      citizenId: input.citizenId,
      deltaMinor: -purchasePriceMinor,
      transactionType: GAME_SURFACE_MARKETPLACE_TRANSACTION_TYPE,
      transactionClass: GAME_SURFACE_MARKETPLACE_TRANSACTION_CLASS,
      reasonCode: GAME_SURFACE_MARKETPLACE_REASON,
      sourceActionId: marketplacePurchaseSourceActionId(input.citizenId, input.itemId),
      idempotencyKey,
      correlationId: input.correlationId,
      worldTimeMs: BigInt(input.gameTimeMs),
    });

    const inventoryResult = await this.gameSurface.addInventoryItem({
      inventoryId: randomUUID(),
      citizenId: input.citizenId,
      itemId: input.itemId,
      acquiredAtGameMs: input.gameTimeMs,
      purchasePriceMinor,
      purchasePriceIndexBps: priceIndexBps,
      idempotencyKey,
    });

    if (!inventoryResult) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    if (inventoryResult.created && this.lifeEvolution) {
      await this.lifeEvolution.recordMarketplacePurchaseNotice({
        citizenId: input.citizenId,
        itemId: input.itemId,
        itemName: item.name,
        priceMinor: purchasePriceMinor,
        worldTimeMs: input.gameTimeMs,
        idempotencyKey,
      });
    }

    if (inventoryResult.created && this.progression) {
      await this.progression.grantForMarketplacePurchase({
        citizenId: input.citizenId,
        itemId: input.itemId,
        worldTimeMs: input.gameTimeMs,
      });
    }

    const balance = await this.economy.getBalance(input.citizenId);
    const inventoryRows = await this.gameSurface.listInventoryByCitizen(input.citizenId);
    const catalog = await this.gameSurface.listMarketplaceItems();
    const priceByItem = new Map(catalog.map((entry) => [entry.itemId, entry.priceMinor]));
    const inventoryValueMinor = inventoryRows.reduce(
      (sum, row) => sum + (priceByItem.get(row.itemId) ?? 0n),
      0n,
    );
    await this.recordEconomicSnapshot({
      citizenId: input.citizenId,
      gameTimeMs: input.gameTimeMs,
      cashMinor: BigInt(balance.availableCash.amountMinor),
      inventoryValueMinor,
    });

    const marketplace = await this.getMarketplace(input.citizenId, input.gameTimeMs);

    return {
      itemId: input.itemId,
      inventoryId: inventoryResult.record.inventoryId,
      duplicate: !inventoryResult.created,
      balance,
      marketplace,
    };
  }

  async sellItem(input: {
    citizenId: string;
    itemId: string;
    gameTimeMs: number;
    clientKey: string;
    correlationId?: string;
  }): Promise<SellItemResultDto> {
    const listing = await this.createPlayerListing({
      citizenId: input.citizenId,
      itemId: input.itemId,
      gameTimeMs: input.gameTimeMs,
      clientKey: input.clientKey,
      correlationId: input.correlationId,
      listingType: 'sale',
    });

    const inventoryRows = await this.gameSurface.listInventoryByCitizen(input.citizenId);
    const owned = inventoryRows.find((row) => row.itemId === input.itemId);
    const balance = await this.economy.getBalance(input.citizenId);
    const detail = await this.gameSurface.findPlayerListing(listing.listingId);

    return {
      itemId: input.itemId,
      inventoryId: owned?.inventoryId ?? '',
      amountMinor: detail?.priceMinor.toString() ?? '0',
      duplicate: listing.duplicate,
      balance,
      marketplace: listing.marketplace,
      listingId: listing.listingId,
      npcResolveAfterGameMs: detail?.npcResolveAfterGameMs ?? null,
    };
  }

  async createPlayerListing(input: {
    citizenId: string;
    itemId: string;
    gameTimeMs: number;
    clientKey: string;
    correlationId?: string;
    listingType?: 'sale' | 'rent';
  }): Promise<{ listingId: string; duplicate: boolean; marketplace: MarketplaceFeedDto }> {
    if (!this.isEnabled()) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }
    if (isConsumableItem(input.itemId) || isFoodItem(input.itemId)) {
      throw new AppError('CONFLICT', 'ITEM_NOT_RESELLABLE', 'error.game_surface.item_not_resellable');
    }

    const catalogDef = getCatalogItemDef(input.itemId);
    const item = await this.gameSurface.findMarketplaceItem(input.itemId);
    if (!item) {
      throw new AppError('NOT_FOUND', 'MARKETPLACE_ITEM_NOT_FOUND', 'error.game_surface.item_not_found');
    }

    const listingType = input.listingType ?? 'sale';
    if (listingType === 'rent' && !isRentableCategory(catalogDef?.categoryId ?? '')) {
      throw new AppError('CONFLICT', 'ITEM_NOT_RENTABLE', 'error.game_surface.item_not_rentable');
    }

    const idempotencyKey = `marketplace-listing:${input.citizenId}:${input.itemId}:${input.clientKey}:${listingType}`;
    const inventoryRows = await this.gameSurface.listInventoryByCitizen(input.citizenId);
    const owned = inventoryRows.find((row) => row.itemId === input.itemId);
    if (!owned) {
      throw new AppError('NOT_FOUND', 'INVENTORY_ITEM_NOT_FOUND', 'error.game_surface.inventory_not_found');
    }

    const activeRentals = await this.gameSurface.listActiveRentalsByTenant(input.citizenId);
    if (activeRentals.some((rental) => rental.itemId === input.itemId)) {
      throw new AppError('CONFLICT', 'ITEM_NOT_RESELLABLE', 'error.game_surface.item_not_resellable');
    }

    if (listingType === 'sale') {
      await this.terminateActiveRentalsForSale({
        ownerCitizenId: input.citizenId,
        itemId: input.itemId,
        gameTimeMs: input.gameTimeMs,
        correlationId: input.correlationId,
      });
    }

    const economicTier = catalogDef?.economicTier ?? 'MEDIO';
    const priceMinor =
      listingType === 'rent'
        ? monthlyRentPriceMinor(item.priceMinor, economicTier)
        : usedListingPriceMinor(item.priceMinor, economicTier);

    const listingId = randomUUID();
    const npcResolveAfterGameMs = npcPriorityWaitGameMs(listingId, input.gameTimeMs);

    const result = await this.gameSurface.createPlayerListing({
      listingId,
      sellerCitizenId: input.citizenId,
      inventoryId: owned.inventoryId,
      itemId: input.itemId,
      priceMinor,
      listedAtGameMs: input.gameTimeMs,
      listingType,
      npcResolveAfterGameMs,
      idempotencyKey,
    });

    const marketplace = await this.getMarketplace(input.citizenId, input.gameTimeMs);
    return {
      listingId: result?.record ? listingId : listingId,
      duplicate: result ? !result.created : false,
      marketplace,
    };
  }

  async buyPlayerListing(input: {
    citizenId: string;
    listingId: string;
    gameTimeMs: number;
    clientKey: string;
    correlationId?: string;
  }): Promise<{ listingId: string; duplicate: boolean; marketplace: MarketplaceFeedDto; balance: BalanceSummaryDto }> {
    if (!this.isEnabled()) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    const listing = await this.gameSurface.findPlayerListing(input.listingId);
    if (!listing || listing.status !== 'active') {
      throw new AppError('NOT_FOUND', 'LISTING_NOT_FOUND', 'error.game_surface.listing_not_found');
    }
    if (listing.sellerCitizenId === input.citizenId) {
      throw new AppError('CONFLICT', 'CANNOT_BUY_OWN_LISTING', 'error.game_surface.cannot_buy_own_listing');
    }

    const idempotencyKey = `marketplace-listing-buy:${input.citizenId}:${input.listingId}:${input.clientKey}`;
    const existing = await this.gameSurface.findPlayerListing(input.listingId);
    if (existing?.status === 'sold') {
      const balance = await this.economy.getBalance(input.citizenId);
      const marketplace = await this.getMarketplace(input.citizenId, input.gameTimeMs);
      return { listingId: input.listingId, duplicate: true, marketplace, balance };
    }

    await this.economy.applyCashDelta({
      citizenId: input.citizenId,
      deltaMinor: -listing.priceMinor,
      transactionType: GAME_SURFACE_MARKETPLACE_TRANSACTION_TYPE,
      transactionClass: GAME_SURFACE_MARKETPLACE_TRANSACTION_CLASS,
      reasonCode: listing.listingType === 'rent' ? 'MARKETPLACE_PLAYER_RENT' : 'MARKETPLACE_PLAYER_BUY',
      sourceActionId: `marketplace-listing-buy:${input.listingId}:${input.citizenId}`,
      idempotencyKey,
      correlationId: input.correlationId,
      worldTimeMs: BigInt(input.gameTimeMs),
    });

    if (listing.listingType === 'rent') {
      await this.economy.applyCashDelta({
        citizenId: listing.sellerCitizenId,
        deltaMinor: listing.priceMinor,
        transactionType: GAME_SURFACE_MARKETPLACE_TRANSACTION_TYPE,
        transactionClass: SLICE_TRANSFER_TRANSACTION_CLASS,
        reasonCode: 'MARKETPLACE_PLAYER_RENT_INCOME',
        sourceActionId: `marketplace-listing-rent:${input.listingId}:${listing.sellerCitizenId}`,
        idempotencyKey: `${idempotencyKey}:seller`,
        correlationId: input.correlationId,
        worldTimeMs: BigInt(input.gameTimeMs),
      });
      const expiresAtGameMs = input.gameTimeMs + MARKETPLACE_RENT_DURATION_MS;
      const catalogDef = getCatalogItemDef(listing.itemId);
      const catalogItem = await this.gameSurface.findMarketplaceItem(listing.itemId);
      const monthlyRent =
        listing.priceMinor ??
        monthlyRentPriceMinor(catalogItem?.priceMinor ?? listing.priceMinor, catalogDef?.economicTier ?? 'MEDIO');
      await this.gameSurface.createCitizenRental({
        rentalId: randomUUID(),
        tenantCitizenId: input.citizenId,
        ownerCitizenId: listing.sellerCitizenId,
        itemId: listing.itemId,
        listingId: input.listingId,
        startedAtGameMs: input.gameTimeMs,
        expiresAtGameMs,
        monthlyRentMinor: monthlyRent,
        idempotencyKey: `rental:${idempotencyKey}`,
      });
      await this.gameSurface.completePlayerListing({
        listingId: input.listingId,
        buyerCitizenId: input.citizenId,
        soldAtGameMs: input.gameTimeMs,
      });
    } else {
      await this.economy.applyCashDelta({
        citizenId: listing.sellerCitizenId,
        deltaMinor: listing.priceMinor,
        transactionType: GAME_SURFACE_MARKETPLACE_TRANSACTION_TYPE,
        transactionClass: SLICE_TRANSFER_TRANSACTION_CLASS,
        reasonCode: 'MARKETPLACE_PLAYER_SELL',
        sourceActionId: `marketplace-listing-sell:${input.listingId}:${listing.sellerCitizenId}`,
        idempotencyKey: `${idempotencyKey}:seller`,
        correlationId: input.correlationId,
        worldTimeMs: BigInt(input.gameTimeMs),
      });

      await this.gameSurface.transferInventoryOwnership(listing.inventoryId, input.citizenId);
      await this.gameSurface.completePlayerListing({
        listingId: input.listingId,
        buyerCitizenId: input.citizenId,
        soldAtGameMs: input.gameTimeMs,
      });
    }

    const balance = await this.economy.getBalance(input.citizenId);
    const marketplace = await this.getMarketplace(input.citizenId, input.gameTimeMs);
    return { listingId: input.listingId, duplicate: false, marketplace, balance };
  }

  async rentMarketplaceItem(input: {
    citizenId: string;
    itemId: string;
    gameTimeMs: number;
    clientKey: string;
    listingId?: string;
    correlationId?: string;
  }): Promise<{ itemId: string; duplicate: boolean; marketplace: MarketplaceFeedDto; balance: BalanceSummaryDto }> {
    if (!this.isEnabled()) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    const def = getCatalogItemDef(input.itemId);
    if (!def || !isRentableCategory(def.categoryId)) {
      throw new AppError('CONFLICT', 'ITEM_NOT_RENTABLE', 'error.game_surface.item_not_rentable');
    }

    const catalogItem = await this.gameSurface.findMarketplaceItem(input.itemId);
    if (!catalogItem) {
      throw new AppError('NOT_FOUND', 'MARKETPLACE_ITEM_NOT_FOUND', 'error.game_surface.item_not_found');
    }

    const priceMinor = monthlyRentPriceMinor(catalogItem.priceMinor, def.economicTier);

    const idempotencyKey = `marketplace-rent:${input.citizenId}:${input.itemId}:${input.clientKey}`;
    const activeRentals = await this.gameSurface.listActiveRentalsByTenant(input.citizenId);
    const existing = activeRentals.find((rental) => rental.itemId === input.itemId);
    if (existing) {
      const balance = await this.economy.getBalance(input.citizenId);
      const marketplace = await this.getMarketplace(input.citizenId, input.gameTimeMs);
      return { itemId: input.itemId, duplicate: true, marketplace, balance };
    }

    await this.economy.applyCashDelta({
      citizenId: input.citizenId,
      deltaMinor: -priceMinor,
      transactionType: GAME_SURFACE_MARKETPLACE_TRANSACTION_TYPE,
      transactionClass: GAME_SURFACE_MARKETPLACE_TRANSACTION_CLASS,
      reasonCode: 'MARKETPLACE_CATALOG_RENT',
      sourceActionId: `marketplace-rent:${input.citizenId}:${input.itemId}`,
      idempotencyKey,
      correlationId: input.correlationId,
      worldTimeMs: BigInt(input.gameTimeMs),
    });

    const expiresAtGameMs = input.gameTimeMs + MARKETPLACE_RENT_DURATION_MS;
    await this.gameSurface.createCitizenRental({
      rentalId: randomUUID(),
      tenantCitizenId: input.citizenId,
      ownerCitizenId: null,
      itemId: input.itemId,
      listingId: input.listingId ?? null,
      startedAtGameMs: input.gameTimeMs,
      expiresAtGameMs,
      monthlyRentMinor: priceMinor,
      idempotencyKey,
    });

    const balance = await this.economy.getBalance(input.citizenId);
    const marketplace = await this.getMarketplace(input.citizenId, input.gameTimeMs);
    return { itemId: input.itemId, duplicate: false, marketplace, balance };
  }

  async getJobOffers(citizenId: string, gameTimeMs: number): Promise<JobOffersFeedDto> {
    if (!this.isEnabled()) {
      return this.disabledFeed<JobOffersFeedDto>({ offers: [], employment: null });
    }

    await this.syncCitizenJobEngagements(citizenId, gameTimeMs);

    const [employment, engagements, personalValues, progression] = await Promise.all([
      this.gameSurface.getEmployment(citizenId),
      this.gameSurface.listJobEngagements(citizenId),
      this.citizens.getPersonalValues(citizenId),
      this.citizens.getProgression(citizenId),
    ]);

    const stats = personalValuesFromPartial(personalValues);
    const mainLevel = progression?.mainLevel ?? 1;
    const dailyOffers = pickDailyJobOffers(gameTimeMs, mainLevel);
    const engagementByOffer = new Map(engagements.map((entry) => [entry.offerId, entry]));

    const offers: JobOfferDto[] = dailyOffers.map((catalogEntry: JobCatalogEntry) => {
      const engagement = engagementByOffer.get(catalogEntry.offerId) ?? null;
      const synced = syncJobEngagementState(engagement, gameTimeMs);
      const uiStatus = resolveJobOfferUiStatus(synced, gameTimeMs);
      const shiftRemaining = remainingShiftMs(synced, gameTimeMs);
      const block = evaluateJobBlocked(catalogEntry.offerId, stats, mainLevel);

      return {
        offerId: catalogEntry.offerId,
        title: catalogEntry.title,
        employer: catalogEntry.employer,
        description: catalogEntry.description,
        occupationCode: catalogEntry.occupationCode,
        salaryHintMinor: catalogEntry.salaryHintMinor.toString(),
        tier: catalogEntry.tier,
        isCriminalOrg: catalogEntry.isCriminalOrg,
        blocked: block.blocked,
        blockReason: block.blockReason,
        ...(resolveJobRequirementsForOffer(catalogEntry.offerId)
          ? { requirements: resolveJobRequirementsForOffer(catalogEntry.offerId)! }
          : {}),
        engagementStatus: uiStatus,
        ...(synced?.shiftEndsAtGameMs != null && uiStatus === 'shift_active'
          ? { shiftEndsAtGameMs: synced.shiftEndsAtGameMs }
          : {}),
        ...(synced?.blockedUntilGameMs != null && uiStatus === 'blocked_today'
          ? { blockedUntilGameMs: synced.blockedUntilGameMs }
          : {}),
        ...(shiftRemaining != null ? { remainingShiftMs: shiftRemaining } : {}),
      };
    });

    return {
      enabled: true,
      offers,
      employment: employment ? await this.toEmploymentDto(employment, citizenId, gameTimeMs) : null,
    };
  }

  async applyForJob(input: {
    citizenId: string;
    offerId: string;
    gameTimeMs: number;
    clientKey: string;
  }): Promise<ApplyJobResultDto> {
    if (!this.isEnabled()) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    const offer = await this.resolveJobOffer(input.offerId);
    if (!offer || !offer.enabled) {
      throw new AppError('NOT_FOUND', 'JOB_OFFER_NOT_FOUND', 'error.game_surface.job_not_found');
    }

    const mainLevel = await resolveCitizenMainLevel(this.citizens, input.citizenId);
    const visibleToday = pickDailyJobOffers(input.gameTimeMs, mainLevel).some(
      (entry) => entry.offerId === input.offerId,
    );
    if (!visibleToday) {
      throw new AppError('NOT_FOUND', 'JOB_OFFER_NOT_FOUND', 'error.game_surface.job_not_found');
    }

    await this.syncCitizenJobEngagements(input.citizenId, input.gameTimeMs);
    const engagements = await this.gameSurface.listJobEngagements(input.citizenId);
    const engagement = engagements.find((entry) => entry.offerId === input.offerId) ?? null;

    const idempotencyKey = jobApplicationIdempotencyKey(
      input.citizenId,
      input.offerId,
      input.clientKey,
    );
    const existingApplication =
      await this.gameSurface.findJobApplicationByIdempotencyKey(idempotencyKey);
    if (existingApplication) {
      const jobs = await this.getJobOffers(input.citizenId, input.gameTimeMs);
      return {
        applicationId: existingApplication.applicationId,
        offerId: input.offerId,
        decision: existingApplication.decision,
        duplicate: true,
        message: this.buildJobApplicationMessage(offer.title, existingApplication.decision),
        jobs,
      };
    }

    if (engagement) {
      throw new AppError('CONFLICT', 'JOB_APPLICATION_NOT_ALLOWED', 'error.game_surface.job_apply_blocked');
    }

    const employment = await this.gameSurface.getEmployment(input.citizenId);
    if (employment?.currentOfferId === input.offerId && employment.employmentState === 'employed') {
      throw new AppError('CONFLICT', 'JOB_APPLICATION_NOT_ALLOWED', 'error.game_surface.job_apply_blocked');
    }

    const personalValues = await this.citizens.getPersonalValues(input.citizenId);
    const stats = personalValuesFromPartial(personalValues);
    const block = evaluateJobBlocked(input.offerId, stats, mainLevel);
    if (block.blocked) {
      throw new AppError('CONFLICT', 'JOB_REQUIREMENTS_NOT_MET', 'error.game_surface.job_requirements');
    }

    const requirementsCheck = meetsJobRequirements(input.offerId, stats, mainLevel);
    if (!requirementsCheck.ok) {
      throw new AppError('CONFLICT', 'JOB_REQUIREMENTS_NOT_MET', 'error.game_surface.job_requirements');
    }

    const applicationId = randomUUID();
    const decisionSeed = `job-application-decision:${idempotencyKey}`;
    const accepted = deterministicChance(decisionSeed, JOB_APPLICATION_ACCEPT_PROBABILITY);
    const decision: 'accepted' | 'rejected' = accepted ? 'accepted' : 'rejected';

    const applicationResult = await this.gameSurface.createJobApplication({
      applicationId,
      citizenId: input.citizenId,
      offerId: input.offerId,
      decision,
      decidedAtGameMs: input.gameTimeMs,
      idempotencyKey,
    });

    if (!applicationResult) {
      throw new AppError('CONFLICT', 'JOB_APPLICATION_NOT_ALLOWED', 'error.game_surface.job_apply_blocked');
    }

    if (!applicationResult.created) {
      const jobs = await this.getJobOffers(input.citizenId, input.gameTimeMs);
      return {
        applicationId: applicationResult.record.applicationId,
        offerId: input.offerId,
        decision: applicationResult.record.decision,
        duplicate: true,
        message: this.buildJobApplicationMessage(offer.title, applicationResult.record.decision),
        jobs,
      };
    }

    if (decision === 'accepted') {
      await this.gameSurface.upsertJobEngagement({
        citizenId: input.citizenId,
        offerId: input.offerId,
        status: 'hired',
        hiredAtGameMs: input.gameTimeMs,
        shiftStartedAtGameMs: null,
        shiftEndsAtGameMs: null,
        blockedUntilGameMs: null,
        lastApplicationId: applicationId,
        updatedAtGameMs: input.gameTimeMs,
      });

      await this.gameSurface.upsertEmployment({
        citizenId: input.citizenId,
        employmentState: 'employed',
        currentOfferId: input.offerId,
        hiredAtGameMs: input.gameTimeMs,
        updatedAtGameMs: input.gameTimeMs,
        idempotencyKey: jobAcceptIdempotencyKey(input.citizenId, input.offerId),
      });

      const occupationLabel =
        OCCUPATION_LABELS[offer.occupationCode as keyof typeof OCCUPATION_LABELS] ?? offer.title;
      if (this.lifeEvolution) {
        await this.lifeEvolution.recordEmploymentChange({
          citizenId: input.citizenId,
          worldTimeMs: input.gameTimeMs,
          employmentState: 'employed',
          occupationLabel,
        });
      }
    }

    await this.recordJobApplicationNotice({
      citizenId: input.citizenId,
      applicationId,
      jobTitle: offer.title,
      accepted: decision === 'accepted',
      worldTimeMs: input.gameTimeMs,
    });

    const jobs = await this.getJobOffers(input.citizenId, input.gameTimeMs);

    return {
      applicationId,
      offerId: input.offerId,
      decision,
      duplicate: false,
      message: this.buildJobApplicationMessage(offer.title, decision),
      jobs,
    };
  }

  async clockInJob(input: {
    citizenId: string;
    offerId: string;
    gameTimeMs: number;
  }): Promise<ClockInJobResultDto> {
    if (!this.isEnabled()) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    const offer = await this.resolveJobOffer(input.offerId);
    if (!offer || !offer.enabled) {
      throw new AppError('NOT_FOUND', 'JOB_OFFER_NOT_FOUND', 'error.game_surface.job_not_found');
    }

    const mainLevel = await resolveCitizenMainLevel(this.citizens, input.citizenId);
    const visibleToday = pickDailyJobOffers(input.gameTimeMs, mainLevel).some(
      (entry) => entry.offerId === input.offerId,
    );
    if (!visibleToday) {
      throw new AppError('NOT_FOUND', 'JOB_OFFER_NOT_FOUND', 'error.game_surface.job_not_found');
    }

    await this.syncCitizenJobEngagements(input.citizenId, input.gameTimeMs);
    const engagement = await this.gameSurface.getJobEngagement(input.citizenId, input.offerId);
    if (!canClockInToJob(engagement, input.gameTimeMs)) {
      throw new AppError('CONFLICT', 'JOB_CLOCK_IN_NOT_ALLOWED', 'error.game_surface.job_clock_in_blocked');
    }

    const dayStart = gameDayStartMs(input.gameTimeMs);
    const idempotencyKey = jobClockInIdempotencyKey(input.citizenId, input.offerId, dayStart);
    const synced = syncJobEngagementState(engagement, input.gameTimeMs);
    if (synced?.status === 'shift_active' && synced.shiftEndsAtGameMs !== null) {
      const jobs = await this.getJobOffers(input.citizenId, input.gameTimeMs);
      return {
        offerId: input.offerId,
        duplicate: true,
        shiftEndsAtGameMs: synced.shiftEndsAtGameMs,
        remainingShiftMs: remainingShiftMs(synced, input.gameTimeMs) ?? 0,
        jobs,
      };
    }

    void idempotencyKey;
    const shiftEndsAtGameMs = input.gameTimeMs + GAME_SURFACE_WORK_SHIFT_DURATION_MS;
    await this.gameSurface.upsertJobEngagement({
      citizenId: input.citizenId,
      offerId: input.offerId,
      status: 'shift_active',
      hiredAtGameMs: synced?.hiredAtGameMs ?? input.gameTimeMs,
      shiftStartedAtGameMs: input.gameTimeMs,
      shiftEndsAtGameMs,
      blockedUntilGameMs: null,
      lastApplicationId: synced?.lastApplicationId ?? null,
      updatedAtGameMs: input.gameTimeMs,
    });

    if (this.progression) {
      await this.progression.grantForJobClockIn({
        citizenId: input.citizenId,
        offerId: input.offerId,
        dayStartMs: dayStart,
        worldTimeMs: input.gameTimeMs,
      });
    }

    const jobs = await this.getJobOffers(input.citizenId, input.gameTimeMs);

    return {
      offerId: input.offerId,
      duplicate: false,
      shiftEndsAtGameMs,
      remainingShiftMs: shiftEndsAtGameMs - input.gameTimeMs,
      jobs,
    };
  }

  async acceptJob(input: {
    citizenId: string;
    offerId: string;
    gameTimeMs: number;
    clientKey?: string;
  }): Promise<AcceptJobResultDto> {
    const result = await this.applyForJob({
      citizenId: input.citizenId,
      offerId: input.offerId,
      gameTimeMs: input.gameTimeMs,
      clientKey: input.clientKey ?? `legacy-accept:${input.offerId}`,
    });

    return {
      offerId: result.offerId,
      employmentState: result.decision === 'accepted' ? 'employed' : 'unemployed',
      duplicate: result.duplicate,
      jobs: result.jobs,
    };
  }

  private buildJobApplicationMessage(jobTitle: string, decision: 'accepted' | 'rejected') {
    if (decision === 'accepted') {
      return {
        decision,
        title: 'Congratulazioni!',
        body: `La tua candidatura per ${jobTitle} è stata accettata.`,
      };
    }

    return {
      decision,
      title: 'Esito candidatura',
      body: `La tua candidatura per ${jobTitle} non è stata accettata.`,
    };
  }

  private async recordJobApplicationNotice(input: {
    citizenId: string;
    applicationId: string;
    jobTitle: string;
    accepted: boolean;
    worldTimeMs: number;
  }): Promise<void> {
    if (!this.lifeEvolution) return;

    await this.lifeEvolution.recordJobApplicationNotice({
      citizenId: input.citizenId,
      applicationId: input.applicationId,
      jobTitle: input.jobTitle,
      accepted: input.accepted,
      worldTimeMs: input.worldTimeMs,
    });
  }

  private async syncCitizenJobEngagements(citizenId: string, gameTimeMs: number): Promise<void> {
    const engagements = await this.gameSurface.listJobEngagements(citizenId);
    for (const engagement of engagements) {
      const synced = syncJobEngagementState(engagement, gameTimeMs);
      if (!synced) continue;

      const changed =
        synced.status !== engagement.status ||
        synced.blockedUntilGameMs !== engagement.blockedUntilGameMs ||
        synced.shiftEndsAtGameMs !== engagement.shiftEndsAtGameMs ||
        synced.shiftStartedAtGameMs !== engagement.shiftStartedAtGameMs;

      if (!changed) continue;

      await this.gameSurface.upsertJobEngagement({
        citizenId: synced.citizenId,
        offerId: synced.offerId,
        status: synced.status,
        hiredAtGameMs: synced.hiredAtGameMs,
        shiftStartedAtGameMs: synced.shiftStartedAtGameMs,
        shiftEndsAtGameMs: synced.shiftEndsAtGameMs,
        blockedUntilGameMs: synced.blockedUntilGameMs,
        lastApplicationId: synced.lastApplicationId,
        updatedAtGameMs: synced.updatedAtGameMs,
      });

      if (engagement.status === 'shift_active' && synced.status === 'blocked_today') {
        await this.processShiftPayroll(citizenId, synced, gameTimeMs);
      }
    }
  }

  private async processShiftPayroll(
    citizenId: string,
    engagement: {
      offerId: string;
      shiftEndsAtGameMs: number | null;
    },
    gameTimeMs: number,
  ): Promise<void> {
    if (engagement.shiftEndsAtGameMs === null) return;

    const payrollKey = jobPayrollIdempotencyKey(
      citizenId,
      engagement.offerId,
      engagement.shiftEndsAtGameMs,
    );
    const existingNotice = await this.temporalEvents.findByIdempotencyKey(
      citizenId,
      `job-payroll-notice:${citizenId}:${engagement.offerId}:${engagement.shiftEndsAtGameMs}`,
    );
    if (existingNotice) return;

    const offer = await this.resolveJobOffer(engagement.offerId);
    if (!offer) return;

    const payMinor = shiftPayMinor(offer.salaryHintMinor);
    if (payMinor <= 0n) return;

    await this.economy.applyCashDelta({
      citizenId,
      deltaMinor: payMinor,
      transactionType: GAME_SURFACE_PAYROLL_TRANSACTION_TYPE,
      transactionClass: SLICE_TRANSFER_TRANSACTION_CLASS,
      reasonCode: GAME_SURFACE_PAYROLL_REASON,
      sourceActionId: payrollKey,
      idempotencyKey: payrollKey,
      worldTimeMs: BigInt(gameTimeMs),
    });

    if (this.lifeEvolution) {
      await this.lifeEvolution.recordPayrollNotice({
        citizenId,
        offerId: engagement.offerId,
        jobTitle: offer.title,
        amountMinor: payMinor,
        shiftEndsAtGameMs: engagement.shiftEndsAtGameMs,
        worldTimeMs: gameTimeMs,
      });
    }

    if (this.progression) {
      await this.progression.grantForJobShiftPayroll({
        citizenId,
        offerId: engagement.offerId,
        shiftEndsAtGameMs: engagement.shiftEndsAtGameMs,
        worldTimeMs: gameTimeMs,
      });
    }

    const balance = await this.economy.getBalance(citizenId);
    const inventoryRows = await this.gameSurface.listInventoryByCitizen(citizenId);
    const catalog = await this.gameSurface.listMarketplaceItems();
    const priceByItem = new Map(catalog.map((entry) => [entry.itemId, entry.priceMinor]));
    const inventoryValueMinor = inventoryRows.reduce(
      (sum, row) => sum + (priceByItem.get(row.itemId) ?? 0n),
      0n,
    );
    await this.recordEconomicSnapshot({
      citizenId,
      gameTimeMs,
      cashMinor: BigInt(balance.availableCash.amountMinor),
      inventoryValueMinor,
    });
  }

  async getMunicipalityOverview(gameTimeMs: number): Promise<MunicipalityOverviewDto> {
    if (!this.isEnabled()) {
      return this.disabledFeed<MunicipalityOverviewDto>({
        treasuryMinor: '0',
        inflationRateBps: DEFAULT_INFLATION_RATE_BPS,
        priceIndexBps: BASE_PRICE_INDEX_BPS,
        citizenCount: 0,
        updatedAtGameMs: gameTimeMs,
        inflationHistory: [],
        recentChronicle: [],
      });
    }

    await this.syncMunicipality(gameTimeMs);
    const [state, inflationHistory, recentChronicle] = await Promise.all([
      this.gameSurface.getMunicipalityState(),
      this.gameSurface.listInflationHistory(500),
      this.gameSurface.listChronicleEntries(8),
    ]);

    return {
      enabled: true,
      treasuryMinor: (state?.treasuryMinor ?? 0n).toString(),
      inflationRateBps: state?.inflationRateBps ?? DEFAULT_INFLATION_RATE_BPS,
      priceIndexBps: state?.priceIndexBps ?? BASE_PRICE_INDEX_BPS,
      citizenCount: state?.citizenCount ?? 0,
      updatedAtGameMs: state?.updatedAtGameMs ?? gameTimeMs,
      inflationHistory: inflationHistory.map((snapshot) => ({
        recordedAtGameMs: snapshot.recordedAtGameMs,
        inflationRateBps: snapshot.inflationRateBps,
        priceIndexBps: snapshot.priceIndexBps ?? BASE_PRICE_INDEX_BPS,
        treasuryMinor: snapshot.treasuryMinor.toString(),
      })),
      recentChronicle: recentChronicle.map((entry) => ({
        entryId: entry.entryId,
        category: entry.category,
        title: entry.title,
        body: entry.body,
        recordedAtGameMs: entry.recordedAtGameMs,
      })),
    };
  }

  async getRankings(gameTimeMs = Date.now()): Promise<RankingsDto> {
    if (!this.isEnabled()) {
      return this.disabledFeed<RankingsDto>({
        wealth: [],
        poverty: [],
        sympathy: [],
        reputation: [],
      });
    }

    const wealth = getMunicipalityWealthRankings(5, gameTimeMs);
    const poverty = getMunicipalityPovertyRankings(5, gameTimeMs);
    const sympathy = getMunicipalitySympathyRankings(5, gameTimeMs);
    const reputation = getMunicipalityReputationRankings(5, gameTimeMs);

    return {
      enabled: true,
      wealth: toRankingEntries(wealth),
      poverty: toRankingEntries(poverty),
      sympathy: toRankingEntries(sympathy),
      reputation: toRankingEntries(reputation),
    };
  }

  async getCitizensDirectory(gameTimeMs = Date.now()): Promise<CitizensDirectoryDto> {
    if (!this.isEnabled()) {
      return this.disabledFeed<CitizensDirectoryDto>({ citizens: [] });
    }

    const rows = getMunicipalityCitizensDirectory(30, gameTimeMs);
    const assignmentRows = this.npcPortraitAssignments
      ? await this.npcPortraitAssignments.listAll()
      : [];
    const assignments = new Map(assignmentRows.map((row) => [row.templateId, row.portraitId]));

    return {
      enabled: true,
      citizens: rows.map(
        (row): CitizenDirectoryEntryDto => ({
          citizenId: row.citizenId,
          templateId: row.citizenId,
          kind: 'npc',
          displayName: row.displayName,
          level: row.level,
          sympathy: row.sympathy,
          reputation: row.reputation,
          portraitId: assignments.get(row.citizenId) ?? null,
        }),
      ),
    };
  }

  async getPublicProfile(targetCitizenId: string): Promise<PublicProfileDto> {
    const citizen = await this.citizens.findById(targetCitizenId);
    if (!citizen) {
      throw new AppError('NOT_FOUND', 'CITIZEN_NOT_FOUND', 'error.citizen.not_found');
    }

    const progression = await this.citizens.getProgression(targetCitizenId);
    const personalValues = await this.citizens.getPersonalValues(targetCitizenId);
    const employment = this.isEnabled() ? await this.gameSurface.getEmployment(targetCitizenId) : null;

    const profileView = this.profile?.resolveProfileView({
      citizen,
      progression,
      personalValues,
    });

    return {
      citizenId: citizen.citizenId,
      displayName: citizen.displayName,
      gender: citizen.gender,
      age: citizen.age,
      portraitId: citizen.portraitId,
      level: progression?.mainLevel ?? 1,
      levelLabel: profileView?.levelLabel ?? 'Cittadino',
      sympathy: personalValues.sympathy ?? 0,
      reputation: personalValues.reputation ?? 0,
      employmentState: employment?.employmentState,
    };
  }

  async sendMessage(input: {
    fromCitizenId: string;
    toCitizenId: string;
    body: string;
    gameTimeMs: number;
    clientKey: string;
  }): Promise<SendMessageResultDto> {
    if (!this.isEnabled()) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    const recipient = await this.citizens.findById(input.toCitizenId);
    if (!recipient) {
      throw new AppError('NOT_FOUND', 'CITIZEN_NOT_FOUND', 'error.citizen.not_found');
    }

    const idempotencyKey = citizenMessageIdempotencyKey(
      input.fromCitizenId,
      input.toCitizenId,
      input.clientKey,
    );
    const result = await this.gameSurface.createMessage({
      messageId: randomUUID(),
      fromCitizenId: input.fromCitizenId,
      toCitizenId: input.toCitizenId,
      body: input.body,
      sentAtGameMs: input.gameTimeMs,
      idempotencyKey,
    });

    if (!result) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    return {
      messageId: result.record.messageId,
      duplicate: !result.created,
    };
  }

  async giftCash(input: {
    fromCitizenId: string;
    toCitizenId: string;
    amountMinor: bigint;
    gameTimeMs: number;
    clientKey: string;
    correlationId?: string;
  }): Promise<GiftCashResultDto> {
    if (!this.isEnabled()) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    if (input.amountMinor <= 0n) {
      throw new AppError('VALIDATION', 'INVALID_AMOUNT', 'error.game_surface.invalid_amount');
    }

    const recipient = await this.citizens.findById(input.toCitizenId);
    if (!recipient) {
      throw new AppError('NOT_FOUND', 'CITIZEN_NOT_FOUND', 'error.citizen.not_found');
    }

    const idempotencyKey = citizenGiftIdempotencyKey(
      input.fromCitizenId,
      input.toCitizenId,
      input.clientKey,
    );

    await this.economy.transfer({
      from: { ownerType: 'citizen', ownerRef: input.fromCitizenId },
      to: { ownerType: 'citizen', ownerRef: input.toCitizenId },
      amountMinor: input.amountMinor,
      currencyId: SLICE_GAME_CURRENCY_ID,
      transactionType: GAME_SURFACE_GIFT_TRANSACTION_TYPE,
      transactionClass: SLICE_TRANSFER_TRANSACTION_CLASS,
      reasonCode: GAME_SURFACE_GIFT_REASON,
      sourceActionId: `gift:${input.fromCitizenId}:${input.toCitizenId}:${input.clientKey}`,
      idempotencyKey,
      correlationId: input.correlationId,
      worldTimeMs: BigInt(input.gameTimeMs),
    });

    const balance = await this.economy.getBalance(input.fromCitizenId);

    return {
      amountMinor: input.amountMinor.toString(),
      duplicate: false,
      balance,
    };
  }

  async loanCash(input: {
    fromCitizenId: string;
    toCitizenId: string;
    amountMinor: bigint;
    gameTimeMs: number;
    clientKey: string;
    correlationId?: string;
  }): Promise<LoanCashResultDto> {
    if (!this.isEnabled()) {
      throw new AppError('TECHNICAL', 'GAME_SURFACE_UNAVAILABLE', 'error.game_surface.unavailable');
    }

    if (input.amountMinor <= 0n) {
      throw new AppError('VALIDATION', 'INVALID_AMOUNT', 'error.game_surface.invalid_amount');
    }

    const recipient = await this.citizens.findById(input.toCitizenId);
    if (!recipient) {
      throw new AppError('NOT_FOUND', 'CITIZEN_NOT_FOUND', 'error.citizen.not_found');
    }

    const idempotencyKey = citizenLoanIdempotencyKey(
      input.fromCitizenId,
      input.toCitizenId,
      input.clientKey,
    );

    await this.economy.transfer({
      from: { ownerType: 'citizen', ownerRef: input.toCitizenId },
      to: { ownerType: 'citizen', ownerRef: input.fromCitizenId },
      amountMinor: input.amountMinor,
      currencyId: SLICE_GAME_CURRENCY_ID,
      transactionType: GAME_SURFACE_LOAN_TRANSACTION_TYPE,
      transactionClass: SLICE_TRANSFER_TRANSACTION_CLASS,
      reasonCode: GAME_SURFACE_LOAN_REASON,
      sourceActionId: `loan:${input.toCitizenId}:${input.fromCitizenId}:${input.clientKey}`,
      idempotencyKey,
      correlationId: input.correlationId,
      worldTimeMs: BigInt(input.gameTimeMs),
    });

    const balance = await this.economy.getBalance(input.fromCitizenId);

    return {
      amountMinor: input.amountMinor.toString(),
      duplicate: false,
      balance,
    };
  }

  async getProfileDetail(citizenId: string, gameTimeMs: number): Promise<ProfileDetailDto> {
    const citizen = await this.citizens.findById(citizenId);
    if (!citizen) {
      throw new AppError('NOT_FOUND', 'CITIZEN_NOT_FOUND', 'error.citizen.not_found');
    }

    const progression = await this.citizens.getProgression(citizenId);
    const personalValuesRaw = this.profile
      ? await this.profile.ensureProfileSeeded(citizen)
      : await this.citizens.getPersonalValues(citizenId);
    const balance = await this.economy.getBalance(citizenId);

    const citizenProfile =
      this.profile?.resolveProfileView({
        citizen,
        progression,
        personalValues: personalValuesRaw,
      }) ?? {
        levelLabel: 'Nuovo in città',
        ageBand: '',
        progression: {
          levelId: progression?.mainLevelId ?? 'main_L01',
          level: progression?.mainLevel ?? 1,
          label: 'Nuovo in città',
          globalXp: progression?.progressionPoints ?? 0,
        },
        unlocked: {},
        locked: [],
      };

    const globalProgression = {
      level: progression?.mainLevel ?? 1,
      levelId: progression?.mainLevelId ?? 'main_L01',
      globalXp: progression?.progressionPoints ?? 0,
    };

    const career = this.career
      ? await this.career.getCareerView(citizenId)
      : {
          currentCareerId: null,
          currentCareerLabel: null,
          currentGradeIndex: 1,
          currentGradeLabel: null,
          affinities: [],
          history: [],
          switchRules: { minAffinityDelta: 15, minSignificantActions: 5 },
        };

    if (!this.isEnabled()) {
      return {
        enabled: false,
        citizenId: citizen.citizenId,
        displayName: citizen.displayName,
        gender: citizen.gender,
        age: citizen.age,
        portraitId: citizen.portraitId,
        citizenProfile,
        globalProgression,
        career,
        balance,
        personalValues: {
          sympathy: personalValuesRaw.sympathy ?? 0,
          reputation: personalValuesRaw.reputation ?? 0,
          happiness: personalValuesRaw.happiness ?? 0,
        },
        employment: null,
        inventory: [],
        patrimonioSnapshots: [],
      };
    }

    await this.gameSurface.expireRentalsBefore(gameTimeMs);

    const [employment, inventory, catalog, activeRentals] = await Promise.all([
      this.gameSurface.getEmployment(citizenId),
      this.gameSurface.listInventoryByCitizen(citizenId),
      this.gameSurface.listMarketplaceItems(),
      this.gameSurface.listActiveRentalsByTenant(citizenId),
    ]);

    const ownedCounts = new Map<string, number>();
    for (const entry of inventory) {
      ownedCounts.set(entry.itemId, (ownedCounts.get(entry.itemId) ?? 0) + 1);
    }

    const catalogById = new Map(catalog.map((item) => [item.itemId, item]));
    const { priceIndexBps, inflationRateBps } = await this.ensureWorldEconomy(gameTimeMs);

    const inventoryItems: MarketplaceItemDto[] = inventory
      .map((entry) => {
        const item = catalogById.get(entry.itemId);
        if (!item) return null;
        const catalogDef = getCatalogItemDef(item.itemId);
        const currentValue = assetCurrentValueMinor({
          purchasePriceMinor: entry.purchasePriceMinor,
          purchasePriceIndexBps: entry.purchasePriceIndexBps,
          catalogBasePriceMinor: item.priceMinor,
          currentPriceIndexBps: priceIndexBps,
          economicTier: catalogDef?.economicTier,
        });
        return toMarketplaceItemDto({
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          categoryId: mapLegacyCategoryToCanonical(item.category, item.itemId),
          priceMinor: currentValue,
          imageKey: catalogDef?.imageKey ?? 'luxury',
          subcategory: catalogDef?.subcategory,
          ownedCount: ownedCounts.get(entry.itemId) ?? 1,
          possessionStatus: 'owned',
          catalogBasePriceMinor: item.priceMinor,
          currentValueMinor: currentValue,
          purchasePriceMinor: entry.purchasePriceMinor ?? undefined,
        });
      })
      .filter((item): item is MarketplaceItemDto => item !== null);

    for (const rental of activeRentals) {
      if (inventoryItems.some((item) => item.itemId === rental.itemId && item.possessionStatus === 'owned')) {
        continue;
      }
      const item = catalogById.get(rental.itemId);
      if (!item) continue;
      inventoryItems.push(
        toMarketplaceItemDto({
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          categoryId: mapLegacyCategoryToCanonical(item.category, item.itemId),
          priceMinor: item.priceMinor,
          imageKey: getCatalogItemDef(item.itemId)?.imageKey ?? 'luxury',
          subcategory: getCatalogItemDef(item.itemId)?.subcategory,
          ownedCount: 0,
          possessionStatus: 'rented',
          rentExpiresAtGameMs: rental.expiresAtGameMs,
          remainingRentMs: Math.max(0, rental.expiresAtGameMs - gameTimeMs),
        }),
      );
    }

    await this.recordEconomicSnapshot({
      citizenId,
      gameTimeMs,
      cashMinor: BigInt(balance.availableCash.amountMinor),
      inventoryValueMinor: inventoryItems.reduce(
        (sum, item) => sum + BigInt(item.currentValueMinor ?? item.priceMinor),
        0n,
      ),
    });

    const refreshedSnapshots = await this.gameSurface.listEconomicSnapshots(citizenId, 500);
    const netWorthMinor =
      BigInt(balance.availableCash.amountMinor) +
      inventoryItems.reduce(
        (sum, item) => sum + BigInt(item.currentValueMinor ?? item.priceMinor),
        0n,
      );

    let monthlySalaryMinor = 0n;
    if (employment?.currentOfferId) {
      const jobOffer = await this.gameSurface.findJobOffer(employment.currentOfferId);
      monthlySalaryMinor = jobOffer?.salaryHintMinor ?? 0n;
    }

    const rentalIncomeMinor = 0n;
    let rentalExpenseMinor = 0n;
    for (const rental of activeRentals) {
      rentalExpenseMinor += rental.monthlyRentMinor ?? 0n;
    }

    const recurringFlows = buildCitizenRecurringFlows({
      monthlySalaryMinor,
      rentalIncomeMinor,
      rentalExpenseMinor,
      hasEmployment: employment?.employmentState === 'employed',
    });
    const purchasingPower = computePurchasingPower({
      cashMinor: BigInt(balance.availableCash.amountMinor),
      monthlySalaryMinor,
      netWorthMinor,
      priceIndexBps,
      inflationRateBps,
    });

    return {
      enabled: true,
      citizenId: citizen.citizenId,
      displayName: citizen.displayName,
      gender: citizen.gender,
      age: citizen.age,
      portraitId: citizen.portraitId,
      citizenProfile,
      globalProgression,
      career,
      balance,
      personalValues: personalValuesFromPartial(personalValuesRaw),
      employment: employment ? await this.toEmploymentDto(employment, citizenId, gameTimeMs) : null,
      inventory: inventoryItems,
      patrimonioSnapshots: refreshedSnapshots.map(
        (snapshot): EconomicSnapshotDto => ({
          recordedAtGameMs: snapshot.recordedAtGameMs,
          cashMinor: snapshot.cashMinor.toString(),
          inventoryValueMinor: snapshot.inventoryValueMinor.toString(),
          netWorthMinor: snapshot.netWorthMinor.toString(),
        }),
      ),
      economicOverview: {
        inflationRateBps,
        priceIndexBps,
        purchasingPowerIndex: purchasingPower.index,
        purchasingPowerLabel: purchasingPower.label,
        effectiveMonthlyMinor: purchasingPower.effectiveMonthlyMinor.toString(),
        recurringFlows,
        netRecurringMinor: netRecurringFlowMinor(recurringFlows).toString(),
      },
    };
  }

  async recordEconomicSnapshot(input: {
    citizenId: string;
    gameTimeMs: number;
    cashMinor: bigint;
    inventoryValueMinor?: bigint;
  }): Promise<void> {
    if (!this.isEnabled()) return;

    const inventoryValueMinor = input.inventoryValueMinor ?? 0n;
    const netWorthMinor = input.cashMinor + inventoryValueMinor;
    const idempotencyKey = economicSnapshotIdempotencyKey(input.citizenId, input.gameTimeMs);

    await this.gameSurface.recordEconomicSnapshot({
      snapshotId: randomUUID(),
      citizenId: input.citizenId,
      recordedAtGameMs: input.gameTimeMs,
      cashMinor: input.cashMinor,
      inventoryValueMinor,
      netWorthMinor,
      idempotencyKey,
    });
  }

  async syncMunicipality(gameTimeMs: number): Promise<void> {
    if (!this.isEnabled()) return;

    await this.ensureWorldEconomy(gameTimeMs);
    await this.maybeRecordChronicleEntry(gameTimeMs);
  }

  private async ensureWorldEconomy(gameTimeMs: number): Promise<{
    inflationRateBps: number;
    priceIndexBps: number;
  }> {
    const citizenCount = getMunicipalityPopulationCount();
    const currentState = await this.gameSurface.getMunicipalityState();
    const inflationRateBps = currentState?.inflationRateBps ?? DEFAULT_INFLATION_RATE_BPS;
    const priceIndexBps = currentState?.priceIndexBps ?? BASE_PRICE_INDEX_BPS;
    const lastInflationTickGameMs =
      currentState?.lastInflationTickGameMs ?? gameTimeMs - INFLATION_TICK_INTERVAL_MS;

    const tick = evolveWorldInflation({
      currentInflationBps: inflationRateBps,
      currentPriceIndexBps: priceIndexBps,
      lastInflationTickGameMs,
      gameTimeMs,
    });

    const nextInflation = tick?.inflationRateBps ?? inflationRateBps;
    const nextPriceIndex = tick?.priceIndexBps ?? priceIndexBps;
    const nextLastTick = tick?.lastInflationTickGameMs ?? lastInflationTickGameMs;

    const state = await this.gameSurface.upsertMunicipalityState({
      citizenCount,
      updatedAtGameMs: gameTimeMs,
      inflationRateBps: nextInflation,
      priceIndexBps: nextPriceIndex,
      lastInflationTickGameMs: nextLastTick,
      treasuryMinor: currentState?.treasuryMinor,
    });

    if (state) {
      await this.recordInflationSnapshot({
        gameTimeMs,
        inflationRateBps: state.inflationRateBps,
        priceIndexBps: state.priceIndexBps,
        treasuryMinor: state.treasuryMinor,
      });
    }

    return {
      inflationRateBps: state?.inflationRateBps ?? nextInflation,
      priceIndexBps: state?.priceIndexBps ?? nextPriceIndex,
    };
  }

  private async maybeRecordChronicleEntry(gameTimeMs: number): Promise<void> {
    const template = pickChronicleTemplate(gameTimeMs);
    const idempotencyKey = municipalityChronicleIdempotencyKey(gameTimeMs);
    const result = await this.gameSurface.recordChronicleEntry({
      entryId: randomUUID(),
      recordedAtGameMs: gameTimeMs,
      category: template.category,
      title: template.title,
      body: template.body,
      idempotencyKey,
    });
    if (!result?.created) return;
  }

  private async recordInflationSnapshot(input: {
    gameTimeMs: number;
    inflationRateBps: number;
    priceIndexBps: number;
    treasuryMinor: bigint;
  }): Promise<void> {
    const idempotencyKey = inflationSnapshotIdempotencyKey(input.gameTimeMs);
    await this.gameSurface.recordInflationSnapshot({
      snapshotId: randomUUID(),
      recordedAtGameMs: input.gameTimeMs,
      inflationRateBps: input.inflationRateBps,
      priceIndexBps: input.priceIndexBps,
      treasuryMinor: input.treasuryMinor,
      idempotencyKey,
    });
  }

  async ensureActiveReferendum(gameTimeMs: number): Promise<void> {
    if (!this.isEnabled()) return;

    const active = await this.gameSurface.findActiveReferendum(gameTimeMs);
    if (active) return;

    const template = pickReferendumTemplate(gameTimeMs);
    const idempotencyKey = demoReferendumIdempotencyKey(gameTimeMs);
    await this.gameSurface.createReferendum({
      referendumId: randomUUID(),
      question: template.question,
      context: template.context,
      status: 'active',
      optionALabel: template.optionALabel,
      optionBLabel: template.optionBLabel,
      startsAtGameMs: gameTimeMs,
      endsAtGameMs: gameTimeMs + GAME_SURFACE_DEMO_REFERENDUM_DURATION_MS,
      idempotencyKey,
      metadata: { templateId: template.templateId },
    });
  }

  private resolveReferendumTemplate(referendum: ReferendumRecord) {
    const templateId = referendum.metadata.templateId;
    if (typeof templateId === 'string') {
      const found = REFERENDUM_TEMPLATES.find((entry) => entry.templateId === templateId);
      if (found) return found;
    }
    return REFERENDUM_TEMPLATES[0]!;
  }

  private async closeExpiredReferendums(gameTimeMs: number): Promise<void> {
    const referendums = await this.gameSurface.listReferendums();
    for (const referendum of referendums) {
      if (referendum.status !== 'active' || gameTimeMs <= referendum.endsAtGameMs) continue;

      const winningOption: 'a' | 'b' =
        referendum.optionAVotes >= referendum.optionBVotes ? 'a' : 'b';
      const template = this.resolveReferendumTemplate(referendum);
      const consequenceSummary =
        winningOption === 'a' ? template.consequenceSummaryA : template.consequenceSummaryB;

      await this.gameSurface.closeReferendum({
        referendumId: referendum.referendumId,
        closedAtGameMs: gameTimeMs,
        winningOption,
        consequenceSummary,
      });

      const treasuryDelta =
        winningOption === 'a' ? template.treasuryDeltaA : template.treasuryDeltaB;
      const inflationDeltaBps =
        winningOption === 'a' ? template.inflationDeltaBpsA : template.inflationDeltaBpsB;
      const state = await this.gameSurface.getMunicipalityState();
      const nextTreasury = (state?.treasuryMinor ?? 0n) + treasuryDelta;
      const nextInflation = Math.max(
        0,
        (state?.inflationRateBps ?? DEFAULT_INFLATION_RATE_BPS) + inflationDeltaBps,
      );
      const currentPriceIndex = state?.priceIndexBps ?? BASE_PRICE_INDEX_BPS;
      const nextPriceIndex = Math.round(
        (currentPriceIndex * (10_000 + inflationDeltaBps)) / 10_000,
      );
      const citizenCount = state?.citizenCount ?? getMunicipalityPopulationCount();
      await this.gameSurface.upsertMunicipalityState({
        citizenCount,
        updatedAtGameMs: gameTimeMs,
        treasuryMinor: nextTreasury,
        inflationRateBps: nextInflation,
        priceIndexBps: nextPriceIndex,
        lastInflationTickGameMs: state?.lastInflationTickGameMs ?? gameTimeMs,
      });

      await this.gameSurface.recordChronicleEntry({
        entryId: randomUUID(),
        recordedAtGameMs: gameTimeMs,
        category: 'politica',
        title: `Referendum: ${referendum.question}`,
        body: consequenceSummary,
        idempotencyKey: `referendum-chronicle:${referendum.referendumId}`,
      });
    }
  }

  private async toEmploymentDto(
    employment: {
      employmentState: string;
      currentOfferId: string | null;
      hiredAtGameMs: number | null;
    },
    citizenId: string,
    gameTimeMs: number,
  ): Promise<CitizenEmploymentDto> {
    const base: CitizenEmploymentDto = {
      employmentState: employment.employmentState,
      currentOfferId: employment.currentOfferId ?? undefined,
      hiredAtGameMs: employment.hiredAtGameMs ?? undefined,
    };

    if (!employment.currentOfferId) return base;

    const offer = await this.resolveJobOffer(employment.currentOfferId);
    if (!offer) return base;

    await this.syncCitizenJobEngagements(citizenId, gameTimeMs);
    const engagement = await this.gameSurface.getJobEngagement(citizenId, employment.currentOfferId);
    const synced = syncJobEngagementState(engagement, gameTimeMs);
    const uiStatus = resolveJobOfferUiStatus(synced, gameTimeMs);
    const shiftRemaining = remainingShiftMs(synced, gameTimeMs);

    return {
      ...base,
      jobTitle: offer.title,
      employer: offer.employer,
      salaryHintMinor: offer.salaryHintMinor.toString(),
      engagementStatus: uiStatus,
      ...(shiftRemaining != null ? { remainingShiftMs: shiftRemaining } : {}),
      ...(synced?.blockedUntilGameMs != null && uiStatus === 'blocked_today'
        ? { blockedUntilGameMs: synced.blockedUntilGameMs }
        : {}),
    };
  }

  private async processNpcListingResolutions(gameTimeMs: number): Promise<void> {
    const ready = await this.gameSurface.listListingsReadyForNpcResolution(gameTimeMs);
    for (const listing of ready) {
      const templateId = pickMarketplaceNpcTemplateId(listing.listingId);
      const npcRef = marketplaceNpcTemplateRef(templateId);
      const npcName = marketplaceNpcDisplayName(npcRef);

      if (listing.listingType === 'rent') {
        const expiresAtGameMs = gameTimeMs + MARKETPLACE_RENT_DURATION_MS;
        await this.economy.applyCashDelta({
          citizenId: listing.sellerCitizenId,
          deltaMinor: listing.priceMinor,
          transactionType: GAME_SURFACE_MARKETPLACE_TRANSACTION_TYPE,
          transactionClass: SLICE_TRANSFER_TRANSACTION_CLASS,
          reasonCode: 'MARKETPLACE_NPC_RENT_INCOME',
          sourceActionId: `marketplace-npc-rent:${listing.listingId}`,
          idempotencyKey: `marketplace-npc-rent:${listing.listingId}:seller`,
          worldTimeMs: BigInt(gameTimeMs),
        });
        await this.gameSurface.createCitizenRental({
          rentalId: randomUUID(),
          tenantNpcId: npcRef,
          ownerCitizenId: listing.sellerCitizenId,
          itemId: listing.itemId,
          listingId: listing.listingId,
          startedAtGameMs: gameTimeMs,
          expiresAtGameMs,
          monthlyRentMinor: listing.priceMinor,
          idempotencyKey: `rental-npc:${listing.listingId}`,
        });
        await this.gameSurface.completePlayerListingWithNpc({
          listingId: listing.listingId,
          buyerNpcId: npcRef,
          soldAtGameMs: gameTimeMs,
        });
        if (this.lifeEvolution) {
          await this.lifeEvolution.recordMarketplaceRentNotice({
            citizenId: listing.sellerCitizenId,
            itemId: listing.itemId,
            tenantLabel: npcName,
            amountMinor: listing.priceMinor,
            worldTimeMs: gameTimeMs,
            idempotencyKey: listing.listingId,
          });
        }
        continue;
      }

      const removed = await this.gameSurface.removeInventoryItem(
        listing.inventoryId,
        listing.sellerCitizenId,
      );
      if (!removed) continue;

      await this.economy.applyCashDelta({
        citizenId: listing.sellerCitizenId,
        deltaMinor: listing.priceMinor,
        transactionType: GAME_SURFACE_MARKETPLACE_TRANSACTION_TYPE,
        transactionClass: SLICE_TRANSFER_TRANSACTION_CLASS,
        reasonCode: 'MARKETPLACE_RESALE_NPC',
        sourceActionId: `marketplace-npc-buy:${listing.listingId}`,
        idempotencyKey: `marketplace-npc-buy:${listing.listingId}:seller`,
        worldTimeMs: BigInt(gameTimeMs),
      });

      await this.gameSurface.completePlayerListingWithNpc({
        listingId: listing.listingId,
        buyerNpcId: npcRef,
        soldAtGameMs: gameTimeMs,
      });

      const def = getCatalogItemDef(listing.itemId);
      if (this.lifeEvolution) {
        await this.lifeEvolution.recordMarketplaceSaleNotice({
          citizenId: listing.sellerCitizenId,
          itemId: listing.itemId,
          itemName: def?.name ?? listing.itemId,
          priceMinor: listing.priceMinor,
          buyerLabel: npcName,
          worldTimeMs: gameTimeMs,
          idempotencyKey: listing.listingId,
        });
      }
    }
  }

  private async terminateActiveRentalsForSale(input: {
    ownerCitizenId: string;
    itemId: string;
    gameTimeMs: number;
    correlationId?: string;
  }): Promise<void> {
    const rentals = await this.gameSurface.listActiveRentalsByOwner(input.ownerCitizenId);
    const active = rentals.filter((rental) => rental.itemId === input.itemId);
    for (const rental of active) {
      const catalogDef = getCatalogItemDef(input.itemId);
      const catalogItem = await this.gameSurface.findMarketplaceItem(input.itemId);
      const monthlyRent =
        rental.monthlyRentMinor ??
        monthlyRentPriceMinor(catalogItem?.priceMinor ?? 0n, catalogDef?.economicTier ?? 'MEDIO');
      const refundMinor = rentedPropertySaleRefundMinor(monthlyRent);

      await this.economy.applyCashDelta({
        citizenId: input.ownerCitizenId,
        deltaMinor: -refundMinor,
        transactionType: GAME_SURFACE_MARKETPLACE_TRANSACTION_TYPE,
        transactionClass: GAME_SURFACE_MARKETPLACE_TRANSACTION_CLASS,
        reasonCode: 'RENTAL_SALE_REFUND',
        sourceActionId: `rental-sale-refund:${rental.rentalId}`,
        idempotencyKey: `rental-sale-refund:${rental.rentalId}:owner`,
        correlationId: input.correlationId,
        worldTimeMs: BigInt(input.gameTimeMs),
      });

      if (rental.tenantCitizenId) {
        await this.economy.applyCashDelta({
          citizenId: rental.tenantCitizenId,
          deltaMinor: refundMinor,
          transactionType: GAME_SURFACE_MARKETPLACE_TRANSACTION_TYPE,
          transactionClass: SLICE_TRANSFER_TRANSACTION_CLASS,
          reasonCode: 'RENTAL_SALE_REFUND',
          sourceActionId: `rental-sale-refund:${rental.rentalId}:tenant`,
          idempotencyKey: `rental-sale-refund:${rental.rentalId}:tenant`,
          correlationId: input.correlationId,
          worldTimeMs: BigInt(input.gameTimeMs),
        });
      }

      await this.gameSurface.terminateRental(rental.rentalId, 'terminated_sale');
    }
  }
}
