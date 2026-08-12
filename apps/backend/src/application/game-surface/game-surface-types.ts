import type { BalanceSummaryDto } from '../economy/economy-service.js';
import type { CitizenProfileViewDto } from '../citizen/citizen-profile-service.js';
import type { CitizenCareerViewDto } from '../citizen/citizen-career-service.js';
import type { GlobalProgressionDto } from '../home/home-service.js';

export type NotificationScope = 'personal' | 'global';

export type GazzettaArticleSource = 'temporal_event' | 'world_event' | 'referendum';

export interface GazzettaArticleDto {
  articleId: string;
  source: GazzettaArticleSource;
  title: string;
  /** Abbreviated feed text */
  summary: string;
  /** Short legacy field — same as summary for backward compatibility */
  body: string;
  /** Full article (~10 lines) */
  fullBody: string;
  comuneLine?: string;
  publishedAtGameMs: number;
  category?: string;
  heroImageKey?: string;
}

export interface GazzettaFeedDto {
  enabled: boolean;
  articles: GazzettaArticleDto[];
}

export interface NotificationDto {
  notificationId: string;
  scope: NotificationScope;
  type: string;
  title: string;
  body: string;
  worldTimeMs: number;
}

export interface NotificationsFeedDto {
  enabled: boolean;
  scope: NotificationScope;
  notifications: NotificationDto[];
}

export interface ReferendumOptionDto {
  optionId: 'a' | 'b';
  label: string;
  votes: number;
}

export interface ReferendumDto {
  referendumId: string;
  question: string;
  context: string;
  problem?: string;
  votingGuide?: string;
  impactSummary?: string;
  heroImageKey?: string;
  status: 'active' | 'closed' | 'scheduled';
  options: ReferendumOptionDto[];
  startsAtGameMs: number;
  endsAtGameMs: number;
  closedAtGameMs?: number;
  remainingMs?: number;
  winningOption?: string;
  consequenceSummary?: string;
  userVote?: 'a' | 'b';
}

export interface ReferendumsFeedDto {
  enabled: boolean;
  referendums: ReferendumDto[];
}

export interface MarketplaceItemDto {
  itemId: string;
  name: string;
  description: string;
  /** Canonical category id */
  categoryId: string;
  /** @deprecated use categoryId */
  category: string;
  priceMinor: string;
  owned: boolean;
  ownedCount: number;
  possessionStatus?: 'available' | 'owned' | 'rented';
  rentExpiresAtGameMs?: number;
  remainingRentMs?: number;
  imageKey: string;
  imagePath?: string;
  slug?: string;
  subcategory?: string;
  economicTier?: string;
  essential?: string;
  isShowcase?: boolean;
  isPlayerListing?: boolean;
  sellerName?: string;
  listingType?: 'sale' | 'rent';
  listingId?: string;
  purchaseBlocked?: boolean;
  purchaseBlockReason?: string;
  minMainLevelRequired?: number;
  /** Catalog price before world index (owned/inventory views). */
  catalogBasePriceMinor?: string;
  /** Estimated current market value. */
  currentValueMinor?: string;
  /** Historical purchase price when owned. */
  purchasePriceMinor?: string;
}

export interface MarketplaceCategoryFeedDto {
  categoryId: string;
  label: string;
  showcase: MarketplaceItemDto[];
  items: MarketplaceItemDto[];
}

export interface MarketplaceFeedDto {
  enabled: boolean;
  /** @deprecated flat list — use categories */
  items: MarketplaceItemDto[];
  categories: MarketplaceCategoryFeedDto[];
  rotationDayKey: number;
}

export interface JobOfferDto {
  offerId: string;
  title: string;
  employer: string;
  description: string;
  occupationCode: number;
  salaryHintMinor: string;
  tier?: 'entry' | 'medium' | 'high' | 'criminal';
  isCriminalOrg?: boolean;
  blocked?: boolean;
  blockReason?: string;
  requirements?: Partial<Record<string, number>> & { mainLevel?: number };
  engagementStatus: 'available' | 'hired' | 'shift_active' | 'blocked_today';
  shiftEndsAtGameMs?: number;
  blockedUntilGameMs?: number;
  remainingShiftMs?: number;
}

export interface CitizenEmploymentDto {
  employmentState: string;
  currentOfferId?: string;
  hiredAtGameMs?: number;
  jobTitle?: string;
  employer?: string;
  salaryHintMinor?: string;
  engagementStatus?: 'available' | 'hired' | 'shift_active' | 'blocked_today';
  remainingShiftMs?: number;
  blockedUntilGameMs?: number;
}

export interface JobOffersFeedDto {
  enabled: boolean;
  offers: JobOfferDto[];
  employment: CitizenEmploymentDto | null;
}

export interface JobApplicationMessageDto {
  title: string;
  body: string;
  decision: 'accepted' | 'rejected';
}

export interface ApplyJobResultDto {
  applicationId: string;
  offerId: string;
  decision: 'accepted' | 'rejected';
  duplicate: boolean;
  message: JobApplicationMessageDto;
  jobs: JobOffersFeedDto;
}

export interface ClockInJobResultDto {
  offerId: string;
  duplicate: boolean;
  shiftEndsAtGameMs: number;
  remainingShiftMs: number;
  jobs: JobOffersFeedDto;
}

export interface RankingEntryDto {
  rank: number;
  citizenId: string;
  displayName: string;
  value: number;
}

export interface RankingsDto {
  enabled: boolean;
  wealth: RankingEntryDto[];
  poverty: RankingEntryDto[];
  sympathy: RankingEntryDto[];
  reputation: RankingEntryDto[];
}

export interface CitizenDirectoryEntryDto {
  citizenId: string;
  templateId: string;
  kind: 'npc' | 'player';
  displayName: string;
  level: number;
  sympathy: number;
  reputation: number;
  portraitId: string | null;
}

export interface CitizensDirectoryDto {
  enabled: boolean;
  citizens: CitizenDirectoryEntryDto[];
}

export interface PublicProfileDto {
  citizenId: string;
  displayName: string;
  gender: string;
  age: number;
  portraitId: string | null;
  level: number;
  levelLabel: string;
  sympathy: number;
  reputation: number;
  employmentState?: string;
}

export interface EconomicSnapshotDto {
  recordedAtGameMs: number;
  cashMinor: string;
  inventoryValueMinor: string;
  netWorthMinor: string;
}

export interface InflationSnapshotDto {
  recordedAtGameMs: number;
  inflationRateBps: number;
  priceIndexBps: number;
  treasuryMinor: string;
}

export interface MunicipalityChronicleEntry {
  entryId: string;
  category: string;
  title: string;
  body: string;
  recordedAtGameMs: number;
}

export interface MunicipalityOverviewDto {
  enabled: boolean;
  treasuryMinor: string;
  inflationRateBps: number;
  priceIndexBps: number;
  citizenCount: number;
  updatedAtGameMs: number;
  inflationHistory: InflationSnapshotDto[];
  recentChronicle?: MunicipalityChronicleEntry[];
}

export interface RecurringFlowDto {
  flowId: string;
  label: string;
  direction: 'income' | 'expense';
  amountMinorPerMonth: string;
  source: string;
}

export interface CitizenEconomicOverviewDto {
  inflationRateBps: number;
  priceIndexBps: number;
  purchasingPowerIndex: number;
  purchasingPowerLabel: string;
  effectiveMonthlyMinor: string;
  recurringFlows: RecurringFlowDto[];
  netRecurringMinor: string;
}

export interface ProfileDetailDto {
  enabled: boolean;
  citizenId: string;
  displayName: string;
  gender: string;
  age: number;
  portraitId: string | null;
  citizenProfile: CitizenProfileViewDto;
  globalProgression: GlobalProgressionDto;
  career: CitizenCareerViewDto;
  balance: BalanceSummaryDto;
  personalValues: { sympathy: number; reputation: number; happiness: number };
  employment: CitizenEmploymentDto | null;
  inventory: MarketplaceItemDto[];
  patrimonioSnapshots: EconomicSnapshotDto[];
  economicOverview?: CitizenEconomicOverviewDto;
}

export interface VoteReferendumResultDto {
  referendumId: string;
  optionId: 'a' | 'b';
  duplicate: boolean;
  referendums: ReferendumDto[];
}

export interface PurchaseItemResultDto {
  itemId: string;
  inventoryId: string;
  duplicate: boolean;
  balance: BalanceSummaryDto;
  marketplace: MarketplaceFeedDto;
}

export interface SellItemResultDto {
  itemId: string;
  inventoryId: string;
  amountMinor: string;
  duplicate: boolean;
  balance: BalanceSummaryDto;
  marketplace: MarketplaceFeedDto;
  listingId?: string;
  npcResolveAfterGameMs?: number | null;
}

export interface AcceptJobResultDto {
  offerId: string;
  employmentState: string;
  duplicate: boolean;
  jobs: JobOffersFeedDto;
}

export interface SendMessageResultDto {
  messageId: string;
  duplicate: boolean;
}

export interface GiftCashResultDto {
  amountMinor: string;
  duplicate: boolean;
  balance: BalanceSummaryDto;
}

export interface LoanCashResultDto {
  amountMinor: string;
  duplicate: boolean;
  balance: BalanceSummaryDto;
}
