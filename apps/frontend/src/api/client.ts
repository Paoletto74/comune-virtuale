import { IDEMPOTENCY_HEADER } from '@comune-virtuale/shared';
import type { CareerView, GlobalProgressionView } from '@/utils/progressionView';
import { randomUUID } from './uuid';

const CORRELATION_HEADER = 'x-correlation-id';

let correlationId: string | null = null;

export function getClientCorrelationId(): string {
  if (!correlationId) {
    correlationId = randomUUID();
  }
  return correlationId;
}

export function resetClientCorrelationId(): void {
  correlationId = randomUUID();
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly messageKey: string,
    public readonly correlationId: string,
    public readonly status: number,
  ) {
    super(messageKey);
  }
}

async function parseError(response: Response, correlationId: string): Promise<ApiError> {
  try {
    const body = (await response.json()) as {
      error?: { code: string; messageKey: string; correlationId: string };
    };
    if (body.error) {
      return new ApiError(body.error.code, body.error.messageKey, body.error.correlationId, response.status);
    }
  } catch {
    // fall through
  }
  return new ApiError('UNKNOWN', 'error.unknown', correlationId, response.status);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cid = getClientCorrelationId();
  const headers = new Headers(init?.headers);
  headers.set(CORRELATION_HEADER, cid);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  });

  const responseCid = response.headers.get(CORRELATION_HEADER);
  if (responseCid) {
    correlationId = responseCid;
  }

  if (!response.ok) {
    throw await parseError(response, cid);
  }

  return response.json() as Promise<T>;
}

export async function apiMutation<T>(
  path: string,
  body: unknown,
  idempotencyKey?: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'POST',
): Promise<T> {
  const key = idempotencyKey ?? randomUUID();
  return apiFetch<T>(path, {
    method,
    body: JSON.stringify(body),
    headers: {
      [IDEMPOTENCY_HEADER]: key,
    },
  });
}

export interface MeResponse {
  accountId: string;
  citizenId: string | null;
  roles: string[];
  needsCitizenCreation: boolean;
  correlationId: string;
}

export interface HomeResponse {
  citizenId: string;
  displayName: string;
  gender: string;
  age: number;
  portraitId: string | null;
  level: { levelId: string; level: number };
  globalProgression: GlobalProgressionView;
  career: CareerView;
  personalValues: { sympathy: number; reputation: number; happiness: number };
  citizenProfile: {
    levelLabel: string;
    ageBand: string;
    progression: {
      levelId: string;
      level: number;
      label: string;
      globalXp: number;
      nextLevel?: number;
      progressToNextLevel?: number;
    };
    unlocked: {
      work?: { label: string; value: string };
      living?: { label: string; value: string };
      personal?: { label: string; value: string };
    };
    locked: Array<{ id: 'work' | 'living' | 'personal'; label: string; hint: string }>;
  };
  knownNpcs: Array<{
    npcId: string;
    templateId: string | null;
    displayName: string;
    category: string;
    narrativeRole: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    relationshipLevel: number;
    interactionCount: number;
    lastOutcomeSummary: string | null;
    lastInteractionAt: string | null;
    portraitId: string | null;
  }>;
  balance: {
    availableCash: { amountMinor: string; currency: string };
    asOf: string;
  };
  activeTasks: Array<{
    taskInstanceId: string;
    taskId: string;
    title: string;
    description: string;
    status: string;
    taskKind?: 'standard' | 'dialogue_step' | 'dialogue_terminal';
    feedState?: 'available' | 'interactive' | 'in_progress' | 'ready' | 'dialogue';
    readyAt?: string;
    pendingOptionId?: string;
    pendingOptionLabel?: string;
    gameplayHints?: {
      tags: Array<
        'normal' | 'positive' | 'economic' | 'high_gain' | 'urgent' | 'risky' | 'ambiguous'
      >;
      maxGainMinor?: string;
    };
    npc?: {
      npcId: string;
      displayName: string;
      category: string;
      narrativeRole: string;
      isKnown: boolean;
      isFirstMeeting: boolean;
      recognitionLine?: string;
      toneLine?: string;
      memoryLine?: string;
      consequenceLine?: string;
      lastOutcomeSummary?: string;
      sentiment?: 'positive' | 'negative' | 'neutral';
      interactionCount?: number;
    };
    options: Array<{
      optionId: string;
      label: string;
      presentationHint?: string;
      statEffects?: {
        sympathy?: number;
        reputation?: number;
        happiness?: number;
        cashMinor?: string;
      };
      attributePreview?: {
        required: Record<string, number>;
        costs: Record<string, number>;
        preview: Record<string, { before: number; after: number }>;
      };
    }>;
    productRequirement?: {
      label: string;
      satisfied: boolean;
      detail: string;
    };
  }>;
  gameTime: {
    worldTimeMs: number;
    timeScale: number;
    realTimestampMs: number;
    isPaused?: boolean;
    schemaVersion?: number;
  };
  gameDate?: {
    day: number;
    hour: number;
    minute: number;
    second: number;
    label: string;
  };
  lifeReview?: {
    reviewId: string;
    title: string;
    body: string;
    severity: 'neutral' | 'ironic' | 'sharp';
    contradictionId?: string;
    worldTimeMs: number;
  } | null;
  levelUpNotice?: {
    eventId: string;
    level: number;
    title: string;
    body: string;
    worldTimeMs: number;
  } | null;
  worldEvents?: {
    enabled: boolean;
    activeEvents: Array<{
      eventId: string;
      type: string;
      scope: string;
      severity: string;
      title: string;
      body: string;
      comuneLine: string | null;
      startedAtGameMs: number;
      endsAtGameMs: number;
      remainingGameMs: number;
    }>;
  };
  recentLifeEvents?: Array<{
    eventId: string;
    eventType: string;
    title: string | null;
    worldTimeMs: number;
  }>;
  flash?: {
    enabled: boolean;
    flashOpportunity: {
      opportunityId: string;
      type: string;
      title: string;
      body: string;
      comuneLine?: string;
      rewardPreview: string;
      decisionDurationMs: number;
      expiresAt: string;
      remainingMs: number;
      npcDisplayName?: string;
      status: string;
    } | null;
    anticipation: {
      active: boolean;
      progress: number;
      label: string | null;
    } | null;
    expiredNotice: string | null;
  };
  correlationId: string;
}

export interface CompleteTaskResponse {
  success: boolean;
  taskInstanceId: string;
  taskId: string;
  optionId: string;
  status: 'completed' | 'waiting';
  messageKey: string;
  personalValues: { sympathy: number; reputation: number; happiness: number };
  economic: {
    cash: { amountMinor: string; currency: string };
  };
  effectsApplied: {
    personalValues: { sympathy: number; reputation: number; happiness: number };
    economic: {
      cash: { deltaMinor: string; currency: string };
    };
    risk?: {
      exposureLevel?: 'none' | 'low' | 'medium' | 'high';
      outcome?: {
        branchId: string;
        visibility: 'visible' | 'hidden';
        messageKey?: string;
      };
    };
  };
  profileUnlocks?: Array<{ dimensionId: string; label: string }>;
  levelUp?: {
    level: number;
    title: string;
    body: string;
    eventId?: string;
  };
  dialogueContinued?: boolean;
  taskWaiting?: boolean;
  readyAt?: string;
  correlationId: string;
}

export const api = {
  health: () => apiFetch<{ status: string; correlationId: string }>('/health'),
  time: () =>
    apiFetch<{ worldTimeMs: number; timeScale: number; realTimestampMs: number }>('/api/v1/time'),
  me: () => apiFetch<MeResponse>('/api/v1/me'),
  devLogin: (devAccountId: string) =>
    apiFetch<{
      success: boolean;
      accountId: string;
      citizenId: string | null;
      needsCitizenCreation: boolean;
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ devAccountId }),
    }),
  previewBootstrap: (idempotencyKey?: string) =>
    apiMutation<{ success: boolean; seeded: string[]; alreadyBootstrapped: boolean }>(
      '/api/v1/dev/preview-bootstrap',
      {},
      idempotencyKey,
    ),
  home: () => apiFetch<HomeResponse>('/api/v1/home'),
  activeTasks: () =>
    apiFetch<{
      tasks: HomeResponse['activeTasks'];
      correlationId: string;
    }>('/api/v1/tasks/active'),
  createCitizen: (
    input: {
      displayName: string;
      gender: string;
      age: number;
      portraitId?: string;
      personality?: { sympathy: number; reputation: number; happiness: number };
    },
    idempotencyKey?: string,
  ) =>
    apiMutation<{
      success: boolean;
      citizenId: string;
      demoTaskInstanceId: string;
    }>('/api/v1/citizens', input, idempotencyKey),
  completeTask: (instanceId: string, optionId: string, idempotencyKey?: string) =>
    apiMutation<CompleteTaskResponse>(
      `/api/v1/tasks/${instanceId}/complete`,
      { optionId },
      idempotencyKey,
    ),
  startTask: (instanceId: string, idempotencyKey?: string) =>
    apiMutation<{ success: boolean; task: HomeResponse['activeTasks'][number] }>(
      `/api/v1/tasks/${instanceId}/start`,
      {},
      idempotencyKey,
    ),
  acceptFlashOpportunity: (opportunityId: string, idempotencyKey?: string) =>
    apiMutation<{
      success: boolean;
      opportunityId: string;
      status: 'accepted';
      cashDeltaMinor?: string;
      sympathyDelta?: number;
      reputationDelta?: number;
      riskMessage?: string;
      comuneLine?: string;
    }>(`/api/v1/flash-opportunities/${opportunityId}/accept`, {}, idempotencyKey),
  declineFlashOpportunity: (opportunityId: string, idempotencyKey?: string) =>
    apiMutation<{ success: boolean; opportunityId: string; status: 'declined' }>(
      `/api/v1/flash-opportunities/${opportunityId}/decline`,
      {},
      idempotencyKey,
    ),
  logout: () => apiFetch<{ success: boolean }>('/api/v1/auth/logout', { method: 'POST' }),
  contentSummary: () =>
    apiFetch<{ packs: unknown[]; loadedAt: string }>('/api/v1/content/summary'),

  gazzetta: (params?: { limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.offset != null) search.set('offset', String(params.offset));
    const qs = search.toString();
    return apiFetch<GazzettaResponse>(`/api/v1/gazzetta${qs ? `?${qs}` : ''}`);
  },

  profileDetail: () => apiFetch<ProfileDetailResponse>('/api/v1/profile/detail'),

  updateProfilePortrait: (portraitId: string, idempotencyKey?: string) =>
    apiMutation<{ success: boolean; citizenId: string; portraitId: string }>(
      '/api/v1/profile/portrait',
      { portraitId },
      idempotencyKey,
      'PATCH',
    ),

  deleteAccount: () =>
    apiFetch<{ success: boolean }>('/api/v1/account', { method: 'DELETE' }),

  citizenPublicProfile: (citizenId: string) =>
    apiFetch<CitizenPublicProfileResponse>(
      `/api/v1/citizens/${encodeURIComponent(citizenId)}/public`,
    ),

  notifications: (params?: { scope?: 'personal' | 'global'; limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.scope) search.set('scope', params.scope);
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.offset != null) search.set('offset', String(params.offset));
    const qs = search.toString();
    return apiFetch<NotificationsResponse>(`/api/v1/notifications${qs ? `?${qs}` : ''}`);
  },

  markNotificationRead: (_notificationId: string) =>
    Promise.resolve({ success: true }),

  referenda: () => apiFetch<ReferendaResponse>('/api/v1/referendums'),

  voteReferendum: (referendumId: string, optionId: 'a' | 'b', idempotencyKey?: string) =>
    apiMutation<{ success: boolean; duplicate?: boolean }>(
      `/api/v1/referendums/${referendumId}/vote`,
      { optionId },
      idempotencyKey,
    ),

  municipality: () => apiFetch<MunicipalityResponse>('/api/v1/municipality'),

  municipalityCitizens: () => apiFetch<MunicipalityCitizensResponse>('/api/v1/citizens'),

  rankings: () => apiFetch<RankingsResponse>('/api/v1/rankings'),

  workJobs: () => apiFetch<WorkJobsResponse>('/api/v1/jobs'),

  workApply: (offerId: string, idempotencyKey?: string) =>
    apiMutation<WorkApplyResponse>(`/api/v1/jobs/${offerId}/apply`, {}, idempotencyKey),

  workClockIn: (offerId: string, idempotencyKey?: string) =>
    apiMutation<WorkClockInResponse>(`/api/v1/jobs/${offerId}/clock-in`, {}, idempotencyKey),

  workAccept: (offerId: string, idempotencyKey?: string) =>
    apiMutation<{ success: boolean; duplicate?: boolean }>(
      `/api/v1/jobs/${offerId}/accept`,
      {},
      idempotencyKey,
    ),

  marketplace: () => apiFetch<MarketplaceResponse>('/api/v1/marketplace'),

  marketplacePurchase: (itemId: string, idempotencyKey?: string) =>
    apiMutation<{ success: boolean; duplicate?: boolean }>(
      `/api/v1/marketplace/${itemId}/purchase`,
      {},
      idempotencyKey,
    ),

  marketplaceSell: (itemId: string, idempotencyKey?: string) =>
    apiMutation<{ success: boolean; amountMinor: string; duplicate?: boolean }>(
      `/api/v1/marketplace/${itemId}/sell`,
      {},
      idempotencyKey,
    ),

  marketplaceCreateListing: (
    itemId: string,
    listingType?: 'sale' | 'rent',
    idempotencyKey?: string,
  ) =>
    apiMutation<{ success: boolean; listingId: string }>(
      '/api/v1/marketplace/listings',
      { itemId, ...(listingType ? { listingType } : {}) },
      idempotencyKey,
    ),

  marketplaceBuyListing: (listingId: string, idempotencyKey?: string) =>
    apiMutation<{ success: boolean; duplicate?: boolean }>(
      `/api/v1/marketplace/listings/${listingId}/buy`,
      {},
      idempotencyKey,
    ),

  marketplaceRent: (itemId: string, listingId?: string, idempotencyKey?: string) =>
    apiMutation<{ success: boolean; duplicate?: boolean }>(
      `/api/v1/marketplace/${itemId}/rent`,
      { ...(listingId ? { listingId } : {}) },
      idempotencyKey,
    ),

  dismissWorldEventPopup: (eventId: string, idempotencyKey?: string) =>
    apiMutation<{ success: boolean; dismissed: boolean }>(
      `/api/v1/world-events/${eventId}/dismiss-popup`,
      {},
      idempotencyKey,
    ),

  adminListNpcs: () =>
    apiFetch<{ npcs: AdminNpcEntry[]; correlationId: string }>('/api/v1/admin/npcs'),

  adminSetNpcPortrait: (templateId: string, portraitId: string) =>
    apiFetch<{ npc: AdminNpcEntry; correlationId: string }>(
      `/api/v1/admin/npcs/${encodeURIComponent(templateId)}/portrait`,
      { method: 'PATCH', body: JSON.stringify({ portraitId }) },
    ),

  adminGetCitizen: (citizenId: string) =>
    apiFetch<{ citizen: AdminCitizenEditable; correlationId: string }>(
      `/api/v1/admin/citizens/${encodeURIComponent(citizenId)}`,
    ),

  adminPatchCitizen: (
    citizenId: string,
    patch: Partial<
      Pick<AdminCitizenEditable, 'displayName' | 'portraitId' | 'mainLevel' | 'sympathy' | 'reputation' | 'happiness'>
    >,
  ) =>
    apiFetch<{ citizen: AdminCitizenEditable; correlationId: string }>(
      `/api/v1/admin/citizens/${encodeURIComponent(citizenId)}`,
      { method: 'PATCH', body: JSON.stringify(patch) },
    ),

  relazioniOverview: () => apiFetch<RelazioniOverviewResponse>('/api/v1/relazioni'),

  listNpcChatScenarios: (templateId: string) =>
    apiFetch<NpcChatScenariosResponse>(
      `/api/v1/relazioni/scenarios/${encodeURIComponent(templateId)}`,
    ),

  npcProfile: (npcId: string) =>
    apiFetch<NpcProfileResponse>(`/api/v1/relazioni/npc/${encodeURIComponent(npcId)}`),

  startNpcChat: (npcId: string, scenarioId: string, idempotencyKey?: string) =>
    apiMutation<ChatStateResponse>(
      `/api/v1/relazioni/npc/${encodeURIComponent(npcId)}/chat/start`,
      { scenarioId, localHour: new Date().getHours() },
      idempotencyKey,
    ),

  startFreeNpcChat: (npcId: string, idempotencyKey?: string) =>
    apiMutation<ChatStateResponse>(
      `/api/v1/relazioni/npc/${encodeURIComponent(npcId)}/chat/free/start`,
      { localHour: new Date().getHours() },
      idempotencyKey,
    ),

  sendNpcChatMessage: (threadId: string, message: string, idempotencyKey?: string) =>
    apiMutation<ChatStateResponse>(
      `/api/v1/relazioni/chat/${encodeURIComponent(threadId)}/message`,
      { message, localHour: new Date().getHours() },
      idempotencyKey,
    ),

  replyNpcChat: (threadId: string, optionId: string, idempotencyKey?: string) =>
    apiMutation<ChatStateResponse>(
      `/api/v1/relazioni/chat/${encodeURIComponent(threadId)}/reply`,
      { optionId },
      idempotencyKey,
    ),

  openSpontaneousChat: (inboxId: string, idempotencyKey?: string) =>
    apiMutation<ChatStateResponse>(
      `/api/v1/relazioni/spontaneous/${encodeURIComponent(inboxId)}/open`,
      { localHour: new Date().getHours() },
      idempotencyKey,
    ),
};

export interface GazzettaArticle {
  articleId: string;
  source?: string;
  title: string;
  body: string;
  summary?: string;
  fullBody?: string;
  comuneLine?: string;
  publishedAtGameMs: number;
  category?: string;
  heroImageKey?: string;
}

export interface GazzettaResponse {
  enabled: boolean;
  articles: GazzettaArticle[];
  correlationId: string;
}

export interface ProfileDetailResponse {
  enabled: boolean;
  citizenId: string;
  displayName: string;
  gender: string;
  age: number;
  portraitId: string | null;
  citizenProfile: HomeResponse['citizenProfile'];
  globalProgression: GlobalProgressionView;
  career: CareerView;
  balance: HomeResponse['balance'];
  personalValues: { sympathy: number; reputation: number; happiness: number };
  employment: {
    employmentState: string;
    currentOfferId?: string;
    hiredAtGameMs?: number;
    jobTitle?: string;
    employer?: string;
    salaryHintMinor?: string;
    engagementStatus?: 'available' | 'hired' | 'shift_active' | 'blocked_today';
    remainingShiftMs?: number;
    blockedUntilGameMs?: number;
  } | null;
  inventory: Array<{
    itemId: string;
    name: string;
    description: string;
    category: string;
    priceMinor: string;
    owned: boolean;
    possessionStatus?: 'available' | 'owned' | 'rented';
    subcategory?: string;
    imageKey?: string;
    remainingRentMs?: number;
    catalogBasePriceMinor?: string;
    currentValueMinor?: string;
    purchasePriceMinor?: string;
  }>;
  patrimonioSnapshots: Array<{
    recordedAtGameMs: number;
    cashMinor: string;
    inventoryValueMinor: string;
    netWorthMinor: string;
  }>;
  economicOverview?: {
    inflationRateBps: number;
    priceIndexBps: number;
    purchasingPowerIndex: number;
    purchasingPowerLabel: string;
    effectiveMonthlyMinor: string;
    recurringFlows: Array<{
      flowId: string;
      label: string;
      direction: 'income' | 'expense';
      amountMinorPerMonth: string;
      source: string;
    }>;
    netRecurringMinor: string;
  };
  correlationId: string;
}

export interface CitizenPublicProfileResponse {
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
  correlationId: string;
}

export interface NotificationItem {
  notificationId: string;
  scope: 'personal' | 'global';
  type: string;
  title: string;
  body: string;
  worldTimeMs: number;
}

export interface NotificationsResponse {
  enabled: boolean;
  scope: 'personal' | 'global';
  notifications: NotificationItem[];
  correlationId: string;
}

export interface ReferendumOption {
  optionId: 'a' | 'b';
  label: string;
  votes: number;
}

export interface ReferendumItem {
  referendumId: string;
  question: string;
  context: string;
  problem?: string;
  votingGuide?: string;
  impactSummary?: string;
  heroImageKey?: string;
  status: 'active' | 'closed' | 'scheduled';
  options: ReferendumOption[];
  startsAtGameMs: number;
  endsAtGameMs: number;
  remainingMs?: number;
  closedAtGameMs?: number;
  winningOption?: string;
  consequenceSummary?: string;
  userVote?: 'a' | 'b';
}

export interface ReferendaResponse {
  enabled: boolean;
  referendums: ReferendumItem[];
  correlationId: string;
}

export interface MunicipalityResponse {
  enabled: boolean;
  treasuryMinor: string;
  inflationRateBps: number;
  priceIndexBps?: number;
  citizenCount: number;
  updatedAtGameMs: number;
  inflationHistory: Array<{
    recordedAtGameMs: number;
    inflationRateBps: number;
    priceIndexBps?: number;
    treasuryMinor: string;
  }>;
  recentChronicle?: Array<{
    entryId: string;
    category: string;
    title: string;
    body: string;
    recordedAtGameMs: number;
  }>;
  correlationId: string;
}

export interface RelazioniPersonDto {
  npcId: string;
  templateId: string | null;
  displayName: string;
  narrativeRole: string;
  occupation: string | null;
  relationshipState: string;
  relationshipStateLabel: string;
  contactUnlocked: boolean;
  chatEnabled: boolean;
  trust: number;
  affection: number;
  conflict: number;
  familiarity: number;
  portraitId: string | null;
  portraitImagePath: string | null;
  portraitStatus: 'present' | 'missing' | 'error';
  availableActions: string[];
}

export interface RelazioniOverviewResponse {
  people: RelazioniPersonDto[];
  groups: Array<{
    groupId: string;
    name: string;
    description: string;
    groupType: string;
    memberCount: number;
    relationshipState: string;
    relationshipStateLabel: string;
    contactUnlocked: boolean;
  }>;
  spontaneousInbox: Array<{
    inboxId: string;
    npcId: string;
    title: string;
    preview: string;
    scenarioId: string;
  }>;
}

export interface NpcChatScenariosResponse {
  scenarios: Array<{
    scenarioId: string;
    title: string;
    actionType: 'chiacchiera' | 'help' | 'flirt' | 'info' | 'free';
    mode?: 'free' | 'preset';
  }>;
}

export interface NpcProfileResponse {
  profile: RelazioniPersonDto & {
    character: string | null;
    linguisticStyle: string | null;
    interests: string[];
    situation: string | null;
    interactionCount: number;
    lastOutcomeSummary: string | null;
  };
}

export interface ChatStateResponse {
  chat: {
    threadId: string;
    scenarioId: string;
    status: string;
    messages: Array<{ speaker: string; body: string; recordedAt: string }>;
    options: Array<{ optionId: string; label: string }>;
    ended: boolean;
    endReason?: string;
    freeTextEnabled?: boolean;
    lastEvaluation?: { intent: string; tone: string; confidence: number };
  };
}

export interface MunicipalityCitizenItem {
  citizenId: string;
  templateId?: string;
  kind?: 'npc' | 'player';
  displayName: string;
  level: number;
  sympathy: number;
  reputation: number;
  portraitId?: string | null;
}

export interface AdminNpcEntry {
  templateId: string;
  displayName: string;
  occupation?: string;
  portraitId: string | null;
  portraitImagePath: string | null;
}

export interface AdminCitizenEditable {
  citizenId: string;
  displayName: string;
  gender: string;
  age: number;
  portraitId: string | null;
  mainLevel: number;
  sympathy: number;
  reputation: number;
  happiness: number;
}

export interface MunicipalityCitizensResponse {
  enabled: boolean;
  citizens: MunicipalityCitizenItem[];
  correlationId: string;
}

export interface RankingEntry {
  rank: number;
  citizenId: string;
  displayName: string;
  value: number;
}

export interface RankingsResponse {
  enabled: boolean;
  wealth: RankingEntry[];
  poverty: RankingEntry[];
  sympathy: RankingEntry[];
  reputation: RankingEntry[];
  correlationId: string;
}

export interface JobOfferItem {
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
  requirements?: Record<string, number> & { mainLevel?: number };
  engagementStatus: 'available' | 'hired' | 'shift_active' | 'blocked_today';
  shiftEndsAtGameMs?: number;
  blockedUntilGameMs?: number;
  remainingShiftMs?: number;
}

export interface WorkJobsResponse {
  enabled: boolean;
  offers: JobOfferItem[];
  employment: {
    employmentState: string;
    currentOfferId?: string;
    hiredAtGameMs?: number;
  } | null;
  correlationId: string;
}

export interface WorkApplyResponse {
  success: boolean;
  applicationId: string;
  offerId: string;
  decision: 'accepted' | 'rejected';
  duplicate: boolean;
  message: {
    title: string;
    body: string;
    decision: 'accepted' | 'rejected';
  };
  jobs: Omit<WorkJobsResponse, 'correlationId'>;
  correlationId: string;
}

export interface WorkClockInResponse {
  success: boolean;
  offerId: string;
  duplicate: boolean;
  shiftEndsAtGameMs: number;
  remainingShiftMs: number;
  jobs: Omit<WorkJobsResponse, 'correlationId'>;
  correlationId: string;
}

export interface MarketplaceItem {
  itemId: string;
  name: string;
  description: string;
  category: string;
  categoryId?: string;
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
}

export interface MarketplaceCategoryFeed {
  categoryId: string;
  label: string;
  showcase: MarketplaceItem[];
  items: MarketplaceItem[];
}

export interface MarketplaceResponse {
  enabled: boolean;
  items: MarketplaceItem[];
  categories: MarketplaceCategoryFeed[];
  rotationDayKey: number;
  correlationId: string;
}
