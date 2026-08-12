import type { WorldTimeSnapshot } from '@comune-virtuale/shared';
import type { DayNightPhase } from '@comune-virtuale/shared';
import type { WorldEventRecord } from '../../application/world/world-event-types.js';
import type { StoryThreadRecord } from '../../application/story/story-thread-types.js';

export interface WorldClockRepository {
  getSnapshot(): Promise<WorldTimeSnapshot>;
  update(input: {
    worldTimeMs: bigint;
    timeScale: number;
    isPaused: boolean;
    schemaVersion: number;
  }): Promise<WorldTimeSnapshot>;
}

export interface SessionRecord {
  sessionId: string;
  accountId: string;
  citizenId: string;
  roles: string[];
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface SessionRepository {
  create(record: Omit<SessionRecord, 'revokedAt'>): Promise<SessionRecord>;
  findById(sessionId: string): Promise<SessionRecord | null>;
  revoke(sessionId: string): Promise<void>;
  updateCitizenId(sessionId: string, citizenId: string): Promise<void>;
}

export interface CitizenRecord {
  citizenId: string;
  accountId: string;
  displayName: string;
  gender: string;
  age: number;
  portraitId: string | null;
  onboardingCompletedAt: Date;
  createdAt: Date;
}

export interface CitizenProgressionRecord {
  citizenId: string;
  mainLevelId: string;
  mainLevel: number;
  progressionPoints: number;
}

export interface CitizenProgressionGrantRecord {
  grantId: string;
  citizenId: string;
  idempotencyKey: string;
  pointsGranted: number;
  sourceType: string;
  sourceRef: string | null;
  createdAt: Date;
}

export interface PersonalValueRecord {
  citizenId: string;
  valueKey: string;
  value: number;
}

export interface TaskInstanceRecord {
  taskInstanceId: string;
  definitionId: string;
  citizenId: string;
  targetNpcId: string | null;
  context: Record<string, unknown>;
  status: string;
  selectedOptionId: string | null;
  completedAt: Date | null;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface CitizenRepository {
  findByAccountId(accountId: string): Promise<CitizenRecord | null>;
  findById(citizenId: string): Promise<CitizenRecord | null>;
  createWithOnboarding(input: {
    citizenId: string;
    accountId: string;
    displayName: string;
    gender: string;
    age: number;
    portraitId?: string | null;
    mainLevelId: string;
    mainLevel: number;
    personalValues: Record<string, number>;
  }): Promise<CitizenRecord>;
  updatePortraitId(citizenId: string, portraitId: string): Promise<CitizenRecord>;
  updateDisplayName(citizenId: string, displayName: string): Promise<CitizenRecord>;
  updateMainLevel(citizenId: string, mainLevel: number, mainLevelId: string): Promise<void>;
  listAll(): Promise<CitizenRecord[]>;
  deleteByCitizenId(citizenId: string): Promise<void>;
  getProgression(citizenId: string): Promise<CitizenProgressionRecord | null>;
  applyProgressionGrant(input: {
    grantId: string;
    citizenId: string;
    idempotencyKey: string;
    pointsGranted: number;
    sourceType: string;
    sourceRef?: string;
  }): Promise<{
    created: boolean;
    grant: CitizenProgressionGrantRecord;
    progression: CitizenProgressionRecord;
  }>;
  getPersonalValues(citizenId: string): Promise<Record<string, number>>;
  incrementPersonalValues(
    citizenId: string,
    deltas: Record<string, number>,
  ): Promise<Record<string, number>>;
  setPersonalValues(
    citizenId: string,
    values: Record<string, number>,
  ): Promise<Record<string, number>>;
  /** Atomically checks requirements, applies costs and deltas. Throws INSUFFICIENT_PERSONAL_VALUE on failure. */
  applyPersonalValueEffects(
    citizenId: string,
    input: {
      requires?: Record<string, number>;
      costs?: Record<string, number>;
      deltas?: Record<string, number>;
    },
  ): Promise<{ values: Record<string, number>; applied: Record<string, number> }>;
  getLastTaskDayPhase(citizenId: string): Promise<DayNightPhase | null>;
  setLastTaskDayPhase(citizenId: string, phase: DayNightPhase): Promise<void>;
}

export interface TaskRepository {
  findActiveByCitizenId(citizenId: string): Promise<TaskInstanceRecord[]>;
  findAllByCitizenId(citizenId: string): Promise<TaskInstanceRecord[]>;
  findById(taskInstanceId: string): Promise<TaskInstanceRecord | null>;
  findByCitizenAndDefinitionId(
    citizenId: string,
    definitionId: string,
  ): Promise<TaskInstanceRecord | null>;
  findBySelectionIdempotencyKey(idempotencyKey: string): Promise<TaskInstanceRecord | null>;
  createTaskInstance(input: {
    taskInstanceId: string;
    definitionId: string;
    citizenId: string;
    targetNpcId: string | null;
    context: Record<string, unknown>;
    status: string;
  }): Promise<TaskInstanceRecord>;
  createTaskInstanceIdempotent(input: {
    citizenId: string;
    idempotencyKey: string;
    taskInstanceId: string;
    definitionId: string;
    targetNpcId: string | null;
    context: Record<string, unknown>;
    status: string;
  }): Promise<{ record: TaskInstanceRecord; created: boolean }>;
  completeTask(input: {
    taskInstanceId: string;
    citizenId: string;
    optionId: string;
    completedAt: Date;
  }): Promise<TaskInstanceRecord>;
  updateTaskInstance(input: {
    taskInstanceId: string;
    citizenId: string;
    status: string;
    context: Record<string, unknown>;
  }): Promise<TaskInstanceRecord>;
  cancelPendingTasks(citizenId: string, taskInstanceIds: readonly string[]): Promise<number>;
}

export interface IdempotencyRecord {
  key: string;
  commandType: string;
  responseBody: unknown;
  statusCode: number;
}

export interface IdempotencyRepository {
  find(key: string): Promise<IdempotencyRecord | null>;
  save(record: IdempotencyRecord, expiresAt: Date): Promise<void>;
}

export interface AuditEntry {
  correlationId: string;
  actorId?: string;
  action: string;
  targetId?: string;
  payload?: Record<string, unknown>;
  worldTimeMs?: bigint;
}

export interface AuditLogRepository {
  append(entry: AuditEntry): Promise<void>;
}

export interface EconomicAccountRecord {
  accountId: string;
  ownerType: 'citizen' | 'npc' | 'system';
  ownerRef: string;
  currencyId: string;
  balanceMinor: bigint;
  updatedAt: Date;
}

export interface EconomicTransferRecord {
  transferId: string;
  idempotencyKey: string;
  sourceActionId: string;
  reasonCode: string;
  transactionType: string;
  transactionClass: string;
  amountMinor: bigint;
  currencyId: string;
  status: string;
  worldTimeMs: bigint | null;
  correlationId: string | null;
  createdAt: Date;
}

/** @deprecated Legacy alias — use EconomicTransferRecord via findTransferByIdempotencyKey */
export interface EconomicTransactionRecord {
  transactionId: string;
  citizenId: string;
  currencyId: string;
  amountMinor: bigint;
  direction: 'credit' | 'debit';
  transactionType: string;
  transactionClass: string;
  reasonCode: string;
  sourceActionId: string;
  idempotencyKey: string;
  status: string;
  worldTimeMs: bigint | null;
  correlationId: string | null;
  createdAt: Date;
}

export interface EconomicOwnerRef {
  ownerType: 'citizen' | 'npc' | 'system';
  ownerRef: string;
}

export interface ApplyCashDeltaInput {
  citizenId: string;
  deltaMinor: bigint;
  transactionType: string;
  transactionClass: string;
  reasonCode: string;
  sourceActionId: string;
  idempotencyKey: string;
  correlationId?: string;
  worldTimeMs?: bigint;
}

export interface ApplyCashDeltaResult {
  transactionId: string;
  balanceMinor: bigint;
  currencyId: string;
  deltaAppliedMinor: bigint;
  duplicate: boolean;
}

export interface TransferInput {
  from: EconomicOwnerRef;
  to: EconomicOwnerRef;
  amountMinor: bigint;
  currencyId: string;
  transactionType: string;
  transactionClass: string;
  reasonCode: string;
  sourceActionId: string;
  idempotencyKey: string;
  correlationId?: string;
  worldTimeMs?: bigint;
}

export interface TransferResult {
  transferId: string;
  amountMinor: bigint;
  currencyId: string;
  sourceBalanceMinor: bigint;
  destinationBalanceMinor: bigint;
  duplicate: boolean;
}

export interface NpcRecord {
  npcId: string;
  displayName: string | null;
  ageCategory: string | null;
  zoneId: string | null;
  npcTemplateId: string | null;
  category: string | null;
  narrativeRole: string | null;
  occupation: string | null;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface NpcRepository {
  findById(npcId: string): Promise<NpcRecord | null>;
  create(input: {
    npcId: string;
    displayName?: string;
    ageCategory?: string;
    zoneId?: string;
    npcTemplateId?: string;
    category?: string;
    narrativeRole?: string;
    occupation?: string;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<NpcRecord>;
}

export type NpcSentiment = 'positive' | 'negative' | 'neutral';

export interface CitizenNpcRelationshipRecord {
  citizenId: string;
  npcId: string;
  relationshipLevel: number;
  interactionCount: number;
  lastInteractionAt: Date | null;
  lastOutcomeKey: string | null;
  lastOutcomeSummary: string | null;
  sentiment: NpcSentiment;
  firstMetAt: Date;
  trust: number;
  affection: number;
  conflict: number;
  familiarity: number;
  relationshipScore: number;
  relationshipState: string;
  contactUnlocked: boolean;
  chatEnabled: boolean;
  metadata: Record<string, unknown>;
}

export interface CitizenNpcInteractionRecord {
  interactionId: string;
  citizenId: string;
  npcId: string;
  taskInstanceId: string | null;
  definitionId: string;
  optionId: string;
  outcomeKey: string;
  outcomeSummary: string;
  occurredAt: Date;
}

export interface CitizenNpcRelationshipRepository {
  findByCitizenAndNpc(citizenId: string, npcId: string): Promise<CitizenNpcRelationshipRecord | null>;
  findKnownByCitizen(citizenId: string): Promise<Array<CitizenNpcRelationshipRecord & { npc: NpcRecord }>>;
  findKnownByTemplate(citizenId: string, npcTemplateId: string): Promise<(CitizenNpcRelationshipRecord & { npc: NpcRecord }) | null>;
  upsertRelationship(input: {
    citizenId: string;
    npcId: string;
    relationshipLevel: number;
    interactionCount: number;
    lastInteractionAt: Date;
    lastOutcomeKey: string;
    lastOutcomeSummary: string;
    sentiment: NpcSentiment;
    firstMetAt?: Date;
    trust?: number;
    affection?: number;
    conflict?: number;
    familiarity?: number;
    relationshipScore?: number;
    relationshipState?: string;
    contactUnlocked?: boolean;
    chatEnabled?: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<CitizenNpcRelationshipRecord>;
  applyRelationshipMetrics(input: {
    citizenId: string;
    npcId: string;
    trust?: number;
    affection?: number;
    conflict?: number;
    familiarity?: number;
    unlockContact?: boolean;
    enableChat?: boolean;
  }): Promise<CitizenNpcRelationshipRecord | null>;
  recordInteraction(input: {
    interactionId: string;
    citizenId: string;
    npcId: string;
    taskInstanceId: string | null;
    definitionId: string;
    optionId: string;
    outcomeKey: string;
    outcomeSummary: string;
    occurredAt: Date;
  }): Promise<CitizenNpcInteractionRecord>;
  listInteractions(citizenId: string, npcId: string): Promise<CitizenNpcInteractionRecord[]>;
}

export interface CreditOwnerInput {
  owner: EconomicOwnerRef;
  amountMinor: bigint;
  transactionType: string;
  transactionClass: string;
  reasonCode: string;
  sourceActionId: string;
  idempotencyKey: string;
  correlationId?: string;
  worldTimeMs?: bigint;
}

export interface CreditOwnerResult {
  transactionId: string;
  balanceMinor: bigint;
  currencyId: string;
  amountCreditedMinor: bigint;
  duplicate: boolean;
}

export interface RiskOutcomeRecord {
  outcomeId: string;
  taskInstanceId: string;
  optionId: string;
  riskSpecRef: string;
  branchId: string;
  resolutionSeed: string;
  rollDigest: string;
  idempotencyKey: string;
  correlationId: string | null;
  createdAt: Date;
}

export interface SaveRiskOutcomeInput {
  outcomeId: string;
  taskInstanceId: string;
  optionId: string;
  riskSpecRef: string;
  branchId: string;
  resolutionSeed: string;
  rollDigest: string;
  idempotencyKey: string;
  correlationId: string | null;
}

export interface RiskOutcomeRepository {
  findByIdempotencyKey(idempotencyKey: string): Promise<RiskOutcomeRecord | null>;
  findByTaskInstanceAndOption(taskInstanceId: string, optionId: string): Promise<RiskOutcomeRecord | null>;
  save(input: SaveRiskOutcomeInput): Promise<RiskOutcomeRecord>;
}

export interface EconomyRepository {
  findTransferByIdempotencyKey(idempotencyKey: string): Promise<EconomicTransferRecord | null>;
  /** @deprecated Use findTransferByIdempotencyKey */
  findTransactionByIdempotencyKey(idempotencyKey: string): Promise<EconomicTransactionRecord | null>;
  getAccount(citizenId: string): Promise<EconomicAccountRecord | null>;
  getAccountByOwner(owner: EconomicOwnerRef, currencyId?: string): Promise<EconomicAccountRecord | null>;
  applyCashDelta(input: ApplyCashDeltaInput): Promise<ApplyCashDeltaResult>;
  creditOwner(input: CreditOwnerInput): Promise<CreditOwnerResult>;
  transfer(input: TransferInput): Promise<TransferResult>;
  grantStarterCash(citizenId: string): Promise<ApplyCashDeltaResult>;
  ensureAccount(owner: EconomicOwnerRef, currencyId?: string): Promise<EconomicAccountRecord>;
}

export interface CitizenLifeEvolutionStateRecord {
  citizenId: string;
  lastLifeReviewWorldMs: number | null;
  completedTasksAtLastReview: number;
  lifeReviewCount: number;
  employmentState: string | null;
  metadata: Record<string, unknown>;
  updatedAt: Date;
}

export interface CitizenTemporalEventRecord {
  eventId: string;
  citizenId: string;
  eventType: string;
  idempotencyKey: string;
  worldTimeMs: number;
  realAt: Date;
  status: string;
  title: string | null;
  body: string | null;
  payload: Record<string, unknown>;
}

export interface CitizenLifeEvolutionRepository {
  findByCitizenId(citizenId: string): Promise<CitizenLifeEvolutionStateRecord | null>;
  ensureState(citizenId: string): Promise<CitizenLifeEvolutionStateRecord>;
  updateAfterLifeReview(input: {
    citizenId: string;
    worldTimeMs: number;
    completedTasksCount: number;
  }): Promise<CitizenLifeEvolutionStateRecord>;
  setEmploymentState(citizenId: string, employmentState: string): Promise<CitizenLifeEvolutionStateRecord>;
}

export interface CitizenTemporalEventRepository {
  findByIdempotencyKey(
    citizenId: string,
    idempotencyKey: string,
  ): Promise<CitizenTemporalEventRecord | null>;
  recordEvent(input: {
    eventId: string;
    citizenId: string;
    eventType: string;
    idempotencyKey: string;
    worldTimeMs: number;
    realAt?: Date;
    status?: string;
    title?: string;
    body?: string;
    payload?: Record<string, unknown>;
  }): Promise<{ record: CitizenTemporalEventRecord; created: boolean }>;
  listRecentByCitizen(citizenId: string, limit?: number): Promise<CitizenTemporalEventRecord[]>;
  countCompletedTasks(citizenId: string): Promise<number>;
}

export interface WorldEventRepository {
  findById(eventId: string): Promise<WorldEventRecord | null>;
  findByIdempotencyKey(idempotencyKey: string): Promise<WorldEventRecord | null>;
  listActiveAtGameTime(gameTimeMs: number): Promise<WorldEventRecord[]>;
  listByStatus(status: string): Promise<WorldEventRecord[]>;
  createEvent(input: {
    eventId: string;
    templateId: string;
    scope: string;
    type: string;
    status: string;
    severity: string;
    title: string;
    body: string;
    comuneLine?: string;
    source?: string;
    startedAtGameMs: number;
    endsAtGameMs: number;
    effects: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    idempotencyKey: string;
    zoneId?: string;
  }): Promise<{ record: WorldEventRecord; created: boolean }>;
  updateStatus(eventId: string, status: string): Promise<WorldEventRecord>;
  endEventsBefore(gameTimeMs: number): Promise<WorldEventRecord[]>;
  activateScheduledEvents(gameTimeMs: number): Promise<WorldEventRecord[]>;
  getSchedulerState(): Promise<{
    lastEvaluatedGameMs: number;
    spawnCycle: number;
    lastSpawnedGameMs: number | null;
  }>;
  saveSchedulerState(input: {
    lastEvaluatedGameMs: number;
    spawnCycle: number;
    lastSpawnedGameMs?: number | null;
  }): Promise<void>;
  findLastEndedByTemplate(templateId: string): Promise<WorldEventRecord | null>;
  recordCitizenNotice(input: {
    citizenId: string;
    worldEventId: string;
    idempotencyKey: string;
  }): Promise<{ created: boolean }>;
  hasCitizenNotice(citizenId: string, worldEventId: string): Promise<boolean>;
  isPopupDismissed(citizenId: string, worldEventId: string): Promise<boolean>;
  markPopupDismissed(citizenId: string, worldEventId: string): Promise<boolean>;
}

export interface FlashOpportunityRecord {
  opportunityId: string;
  citizenId: string;
  type: string;
  templateId: string;
  title: string;
  body: string;
  sourceContext: Record<string, unknown>;
  reward: Record<string, unknown>;
  risk: Record<string, unknown> | null;
  expiresAt: Date;
  createdAt: Date;
  status: string;
  metadata: Record<string, unknown>;
  idempotencyKey: string;
}

export interface CitizenFlashSpawnStateRecord {
  citizenId: string;
  spawnCycle: number;
  anticipationStartedAt: Date | null;
  anticipationDurationMs: number | null;
  anticipationLabel: string | null;
  nextSpawnEligibleAt: Date | null;
  lastOpportunityAt: Date | null;
  lastExpiredNotice: string | null;
  metadata: Record<string, unknown>;
  updatedAt: Date;
}

export interface FlashOpportunityRepository {
  findById(opportunityId: string): Promise<FlashOpportunityRecord | null>;
  findByIdempotencyKey(citizenId: string, idempotencyKey: string): Promise<FlashOpportunityRecord | null>;
  findPendingByCitizenId(citizenId: string, now: Date): Promise<FlashOpportunityRecord | null>;
  countPendingByCitizenId(citizenId: string): Promise<number>;
  create(input: {
    opportunityId: string;
    citizenId: string;
    type: string;
    templateId: string;
    title: string;
    body: string;
    sourceContext?: Record<string, unknown>;
    reward?: Record<string, unknown>;
    risk?: Record<string, unknown> | null;
    expiresAt: Date;
    idempotencyKey: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ record: FlashOpportunityRecord; created: boolean }>;
  updateStatus(
    opportunityId: string,
    status: string,
    metadata?: Record<string, unknown>,
  ): Promise<FlashOpportunityRecord>;
  expirePendingBefore(citizenId: string, now: Date): Promise<FlashOpportunityRecord[]>;
}

export interface CitizenFlashSpawnStateRepository {
  findByCitizenId(citizenId: string): Promise<CitizenFlashSpawnStateRecord | null>;
  ensureState(citizenId: string): Promise<CitizenFlashSpawnStateRecord>;
  save(input: CitizenFlashSpawnStateRecord): Promise<CitizenFlashSpawnStateRecord>;
}

export interface StoryThreadRepository {
  findById(threadId: string): Promise<StoryThreadRecord | null>;
  findByIdempotencyKey(idempotencyKey: string): Promise<StoryThreadRecord | null>;
  listByCitizenId(citizenId: string): Promise<StoryThreadRecord[]>;
  listActiveForSelection(citizenId: string, gameTimeMs: number): Promise<StoryThreadRecord[]>;
  countActiveByCitizenId(citizenId: string, gameTimeMs: number): Promise<number>;
  createThread(input: {
    threadId: string;
    citizenId: string;
    type: string;
    status: string;
    origin: string;
    stage: number;
    priority: number;
    createdAtGameMs: number;
    lastActivityGameMs: number;
    dormantUntilGameMs?: number | null;
    expiresAtGameMs?: number | null;
    context: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    idempotencyKey: string;
  }): Promise<{ record: StoryThreadRecord; created: boolean }>;
  updateThread(
    threadId: string,
    patch: {
      status?: string;
      stage?: number;
      priority?: number;
      lastActivityGameMs?: number;
      dormantUntilGameMs?: number | null;
      expiresAtGameMs?: number | null;
      context?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    },
  ): Promise<StoryThreadRecord>;
  expireThreadsBefore(citizenId: string, gameTimeMs: number): Promise<StoryThreadRecord[]>;
  reactivateDormantThreads(citizenId: string, gameTimeMs: number): Promise<StoryThreadRecord[]>;
}

export interface MunicipalityStateRecord {
  treasuryMinor: bigint;
  inflationRateBps: number;
  priceIndexBps: number;
  lastInflationTickGameMs: number;
  citizenCount: number;
  updatedAtGameMs: number;
  metadata: Record<string, unknown>;
}

export interface MunicipalityChronicleRecord {
  entryId: string;
  recordedAtGameMs: number;
  category: string;
  title: string;
  body: string;
  idempotencyKey: string;
}

export interface ReferendumRecord {
  referendumId: string;
  question: string;
  context: string;
  status: string;
  optionALabel: string;
  optionBLabel: string;
  optionAVotes: number;
  optionBVotes: number;
  startsAtGameMs: number;
  endsAtGameMs: number;
  closedAtGameMs: number | null;
  winningOption: string | null;
  consequenceSummary: string | null;
  idempotencyKey: string;
  metadata: Record<string, unknown>;
}

export interface ReferendumVoteRecord {
  voteId: string;
  referendumId: string;
  citizenId: string;
  optionId: string;
  votedAtGameMs: number;
  idempotencyKey: string;
}

export interface MarketplaceItemRecord {
  itemId: string;
  name: string;
  description: string;
  category: string;
  priceMinor: bigint;
  effectKey: string | null;
  enabled: boolean;
}

export interface CitizenInventoryRecord {
  inventoryId: string;
  citizenId: string;
  itemId: string;
  acquiredAtGameMs: number;
  purchasePriceMinor: bigint | null;
  purchasePriceIndexBps: number | null;
  idempotencyKey: string;
}

export interface JobOfferRecord {
  offerId: string;
  title: string;
  employer: string;
  description: string;
  occupationCode: number;
  salaryHintMinor: bigint;
  enabled: boolean;
}

export interface CitizenEmploymentRecord {
  citizenId: string;
  employmentState: string;
  currentOfferId: string | null;
  hiredAtGameMs: number | null;
  updatedAtGameMs: number;
}

export type JobEngagementStatus = 'hired' | 'shift_active' | 'blocked_today';

export interface CitizenJobApplicationRecord {
  applicationId: string;
  citizenId: string;
  offerId: string;
  decision: 'accepted' | 'rejected';
  decidedAtGameMs: number;
  idempotencyKey: string;
}

export interface CitizenJobEngagementRecord {
  citizenId: string;
  offerId: string;
  status: JobEngagementStatus;
  hiredAtGameMs: number | null;
  shiftStartedAtGameMs: number | null;
  shiftEndsAtGameMs: number | null;
  blockedUntilGameMs: number | null;
  lastApplicationId: string | null;
  updatedAtGameMs: number;
}

export interface CitizenMessageRecord {
  messageId: string;
  fromCitizenId: string;
  toCitizenId: string;
  body: string;
  sentAtGameMs: number;
  idempotencyKey: string;
}

export interface CitizenEconomicSnapshotRecord {
  snapshotId: string;
  citizenId: string;
  recordedAtGameMs: number;
  cashMinor: bigint;
  inventoryValueMinor: bigint;
  netWorthMinor: bigint;
  idempotencyKey: string;
}

export interface MunicipalityInflationSnapshotRecord {
  snapshotId: string;
  recordedAtGameMs: number;
  inflationRateBps: number;
  priceIndexBps: number;
  treasuryMinor: bigint;
  idempotencyKey: string;
}

export interface CitizenRankingRecord {
  citizenId: string;
  displayName: string;
  value: number;
}

/** Municipality directory entry — sourced from INITIAL_NPC_ROSTER via municipality-citizen-profiles. */
export interface CitizenDirectoryRecord {
  citizenId: string;
  displayName: string;
  level: number;
  sympathy: number;
  reputation: number;
}

export interface GameSurfaceRepository {
  isStorageAvailable(): boolean;
  getMunicipalityState(): Promise<MunicipalityStateRecord | null>;
  upsertMunicipalityState(input: {
    treasuryMinor?: bigint;
    inflationRateBps?: number;
    priceIndexBps?: number;
    lastInflationTickGameMs?: number;
    citizenCount: number;
    updatedAtGameMs: number;
  }): Promise<MunicipalityStateRecord | null>;
  listReferendums(): Promise<ReferendumRecord[]>;
  findReferendumById(referendumId: string): Promise<ReferendumRecord | null>;
  findActiveReferendum(gameTimeMs: number): Promise<ReferendumRecord | null>;
  createReferendum(input: {
    referendumId: string;
    question: string;
    context: string;
    status: string;
    optionALabel: string;
    optionBLabel: string;
    startsAtGameMs: number;
    endsAtGameMs: number;
    idempotencyKey: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ record: ReferendumRecord; created: boolean } | null>;
  findVoteByCitizen(referendumId: string, citizenId: string): Promise<ReferendumVoteRecord | null>;
  findVoteByIdempotencyKey(idempotencyKey: string): Promise<ReferendumVoteRecord | null>;
  recordReferendumVote(input: {
    voteId: string;
    referendumId: string;
    citizenId: string;
    optionId: string;
    votedAtGameMs: number;
    idempotencyKey: string;
  }): Promise<{ record: ReferendumVoteRecord; created: boolean } | null>;
  incrementReferendumVote(referendumId: string, optionId: 'a' | 'b'): Promise<void>;
  closeReferendum(input: {
    referendumId: string;
    closedAtGameMs: number;
    winningOption: 'a' | 'b';
    consequenceSummary: string;
  }): Promise<ReferendumRecord | null>;
  listClosedReferendums(limit?: number): Promise<ReferendumRecord[]>;
  listMarketplaceItems(): Promise<MarketplaceItemRecord[]>;
  findMarketplaceItem(itemId: string): Promise<MarketplaceItemRecord | null>;
  findInventoryByIdempotencyKey(idempotencyKey: string): Promise<CitizenInventoryRecord | null>;
  listInventoryByCitizen(citizenId: string): Promise<CitizenInventoryRecord[]>;
  addInventoryItem(input: {
    inventoryId: string;
    citizenId: string;
    itemId: string;
    acquiredAtGameMs: number;
    purchasePriceMinor?: bigint | null;
    purchasePriceIndexBps?: number | null;
    idempotencyKey: string;
  }): Promise<{ record: CitizenInventoryRecord; created: boolean } | null>;
  removeInventoryItem(inventoryId: string, citizenId: string): Promise<boolean>;
  listActivePlayerListings(limit?: number): Promise<
    Array<{
      listingId: string;
      sellerCitizenId: string;
      inventoryId: string;
      itemId: string;
      listingType: 'sale' | 'rent';
      priceMinor: bigint;
      listedAtGameMs: number;
      expiresAtGameMs: number | null;
      status: string;
      idempotencyKey: string;
    }>
  >;
  findPlayerListing(listingId: string): Promise<{
    listingId: string;
    sellerCitizenId: string;
    inventoryId: string;
    itemId: string;
    listingType: 'sale' | 'rent';
    priceMinor: bigint;
    listedAtGameMs: number;
    expiresAtGameMs: number | null;
      npcResolveAfterGameMs?: number | null;
      status: string;
      idempotencyKey: string;
    } | null>;
  createPlayerListing(input: {
    listingId: string;
    sellerCitizenId: string;
    inventoryId: string;
    itemId: string;
    priceMinor: bigint;
    listedAtGameMs: number;
    idempotencyKey: string;
    listingType?: 'sale' | 'rent';
    npcResolveAfterGameMs?: number;
  }): Promise<{ record: unknown; created: boolean } | null>;
  completePlayerListing(input: {
    listingId: string;
    buyerCitizenId: string;
    soldAtGameMs: number;
  }): Promise<unknown | null>;
  completePlayerListingWithNpc(input: {
    listingId: string;
    buyerNpcId: string;
    soldAtGameMs: number;
  }): Promise<unknown | null>;
  listListingsReadyForNpcResolution(gameTimeMs: number): Promise<
    Array<{
      listingId: string;
      sellerCitizenId: string;
      inventoryId: string;
      itemId: string;
      listingType: 'sale' | 'rent';
      priceMinor: bigint;
      listedAtGameMs: number;
      npcResolveAfterGameMs: number | null;
      status: string;
      idempotencyKey: string;
    }>
  >;
  transferInventoryOwnership(inventoryId: string, newCitizenId: string): Promise<unknown | null>;
  createCitizenRental(input: {
    rentalId: string;
    tenantCitizenId?: string | null;
    tenantNpcId?: string | null;
    ownerCitizenId: string | null;
    itemId: string;
    listingId?: string | null;
    startedAtGameMs: number;
    expiresAtGameMs: number;
    monthlyRentMinor?: bigint;
    idempotencyKey: string;
  }): Promise<{ record: unknown; created: boolean } | null>;
  listActiveRentalsByTenant(tenantCitizenId: string): Promise<
    Array<{
      rentalId: string;
      tenantCitizenId: string | null;
      tenantNpcId: string | null;
      ownerCitizenId: string | null;
      itemId: string;
      listingId: string | null;
      startedAtGameMs: number;
      expiresAtGameMs: number;
      monthlyRentMinor: bigint | null;
      status: string;
      idempotencyKey: string;
    }>
  >;
  listActiveRentalsByOwner(ownerCitizenId: string): Promise<
    Array<{
      rentalId: string;
      tenantCitizenId: string | null;
      tenantNpcId: string | null;
      ownerCitizenId: string | null;
      itemId: string;
      listingId: string | null;
      startedAtGameMs: number;
      expiresAtGameMs: number;
      monthlyRentMinor: bigint | null;
      status: string;
      idempotencyKey: string;
    }>
  >;
  terminateRental(rentalId: string, status: string): Promise<unknown | null>;
  expireRentalsBefore(gameTimeMs: number): Promise<void>;
  listJobOffers(): Promise<JobOfferRecord[]>;
  findJobOffer(offerId: string): Promise<JobOfferRecord | null>;
  getEmployment(citizenId: string): Promise<CitizenEmploymentRecord | null>;
  upsertEmployment(input: {
    citizenId: string;
    employmentState: string;
    currentOfferId?: string | null;
    hiredAtGameMs?: number | null;
    updatedAtGameMs: number;
    idempotencyKey: string;
  }): Promise<{ record: CitizenEmploymentRecord; created: boolean } | null>;
  findEmploymentByIdempotencyKey(idempotencyKey: string): Promise<CitizenEmploymentRecord | null>;
  createJobApplication(input: {
    applicationId: string;
    citizenId: string;
    offerId: string;
    decision: 'accepted' | 'rejected';
    decidedAtGameMs: number;
    idempotencyKey: string;
  }): Promise<{ record: CitizenJobApplicationRecord; created: boolean } | null>;
  findJobApplicationByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<CitizenJobApplicationRecord | null>;
  listJobEngagements(citizenId: string): Promise<CitizenJobEngagementRecord[]>;
  getJobEngagement(
    citizenId: string,
    offerId: string,
  ): Promise<CitizenJobEngagementRecord | null>;
  upsertJobEngagement(input: {
    citizenId: string;
    offerId: string;
    status: JobEngagementStatus;
    hiredAtGameMs?: number | null;
    shiftStartedAtGameMs?: number | null;
    shiftEndsAtGameMs?: number | null;
    blockedUntilGameMs?: number | null;
    lastApplicationId?: string | null;
    updatedAtGameMs: number;
  }): Promise<CitizenJobEngagementRecord | null>;
  createMessage(input: {
    messageId: string;
    fromCitizenId: string;
    toCitizenId: string;
    body: string;
    sentAtGameMs: number;
    idempotencyKey: string;
  }): Promise<{ record: CitizenMessageRecord; created: boolean } | null>;
  findMessageByIdempotencyKey(idempotencyKey: string): Promise<CitizenMessageRecord | null>;
  recordEconomicSnapshot(input: {
    snapshotId: string;
    citizenId: string;
    recordedAtGameMs: number;
    cashMinor: bigint;
    inventoryValueMinor: bigint;
    netWorthMinor: bigint;
    idempotencyKey: string;
  }): Promise<{ record: CitizenEconomicSnapshotRecord; created: boolean } | null>;
  listEconomicSnapshots(citizenId: string, limit?: number): Promise<CitizenEconomicSnapshotRecord[]>;
  recordInflationSnapshot(input: {
    snapshotId: string;
    recordedAtGameMs: number;
    inflationRateBps: number;
    priceIndexBps: number;
    treasuryMinor: bigint;
    idempotencyKey: string;
  }): Promise<{ record: MunicipalityInflationSnapshotRecord; created: boolean } | null>;
  listInflationHistory(limit?: number): Promise<MunicipalityInflationSnapshotRecord[]>;
  recordChronicleEntry(input: {
    entryId: string;
    recordedAtGameMs: number;
    category: string;
    title: string;
    body: string;
    idempotencyKey: string;
  }): Promise<{ record: MunicipalityChronicleRecord; created: boolean } | null>;
  listChronicleEntries(limit?: number): Promise<MunicipalityChronicleRecord[]>;
}
