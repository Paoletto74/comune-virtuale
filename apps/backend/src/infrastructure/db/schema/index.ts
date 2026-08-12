import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  doublePrecision,
  unique,
} from 'drizzle-orm/pg-core';

/** Singleton world clock — server-authoritative Game Time */
export const worldClock = pgTable('world_clock', {
  id: integer('id').primaryKey().default(1),
  worldTimeMs: bigint('world_time_ms', { mode: 'bigint' }).notNull(),
  timeScale: doublePrecision('time_scale').notNull().default(1.0),
  realUpdatedAt: timestamp('real_updated_at', { withTimezone: true }).notNull().defaultNow(),
  isPaused: boolean('is_paused').notNull().default(false),
  schemaVersion: integer('schema_version').notNull().default(1),
});

export const sessions = pgTable('sessions', {
  sessionId: text('session_id').primaryKey(),
  accountId: text('account_id').notNull(),
  citizenId: text('citizen_id').notNull(),
  roles: jsonb('roles').$type<string[]>().notNull().default(['PLAYER']),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const idempotencyKeys = pgTable('idempotency_keys', {
  key: text('key').primaryKey(),
  commandType: text('command_type').notNull(),
  responseBody: jsonb('response_body').notNull(),
  statusCode: integer('status_code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const auditLog = pgTable('audit_log', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  correlationId: text('correlation_id').notNull(),
  actorId: text('actor_id'),
  action: text('action').notNull(),
  targetId: text('target_id'),
  payload: jsonb('payload'),
  worldTimeMs: bigint('world_time_ms', { mode: 'bigint' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const citizens = pgTable('citizens', {
  citizenId: text('citizen_id').primaryKey(),
  accountId: text('account_id').notNull().unique(),
  displayName: text('display_name').notNull(),
  gender: text('gender').notNull(),
  age: integer('age').notNull(),
  portraitId: text('portrait_id'),
  onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastTaskDayPhase: text('last_task_day_phase'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const citizenProgression = pgTable('citizen_progression', {
  citizenId: text('citizen_id')
    .primaryKey()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  mainLevelId: text('main_level_id').notNull().default('main_L01'),
  mainLevel: integer('main_level').notNull().default(1),
  progressionPoints: integer('progression_points').notNull().default(0),
});

export const citizenProgressionGrants = pgTable(
  'citizen_progression_grants',
  {
    grantId: text('grant_id').primaryKey(),
    citizenId: text('citizen_id')
      .notNull()
      .references(() => citizens.citizenId, { onDelete: 'cascade' }),
    idempotencyKey: text('idempotency_key').notNull(),
    pointsGranted: integer('points_granted').notNull(),
    sourceType: text('source_type').notNull(),
    sourceRef: text('source_ref'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('citizen_progression_grants_citizen_idempotency_unique').on(
      table.citizenId,
      table.idempotencyKey,
    ),
  ],
);

export const citizenPersonalValues = pgTable(
  'citizen_personal_values',
  {
    citizenId: text('citizen_id')
      .notNull()
      .references(() => citizens.citizenId, { onDelete: 'cascade' }),
    valueKey: text('value_key').notNull(),
    value: integer('value').notNull(),
  },
  (table) => [primaryKey({ columns: [table.citizenId, table.valueKey] })],
);

export const citizenCareerState = pgTable('citizen_career_state', {
  citizenId: text('citizen_id')
    .primaryKey()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  currentCareerId: text('current_career_id'),
  currentGradeIndex: integer('current_grade_index').notNull().default(1),
  emergingTrajectories: jsonb('emerging_trajectories')
    .$type<Array<{ careerId: string; score: number; lastUpdatedAt: string }>>()
    .notNull()
    .default([]),
  pendingSwitchCareerId: text('pending_switch_career_id'),
  pendingSwitchStreak: integer('pending_switch_streak').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const citizenCareerAffinities = pgTable(
  'citizen_career_affinities',
  {
    citizenId: text('citizen_id')
      .notNull()
      .references(() => citizens.citizenId, { onDelete: 'cascade' }),
    careerId: text('career_id').notNull(),
    affinity: integer('affinity').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.citizenId, table.careerId] })],
);

export const citizenCareerHistory = pgTable('citizen_career_history', {
  historyId: text('history_id').primaryKey(),
  citizenId: text('citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  careerId: text('career_id').notNull(),
  gradeIndex: integer('grade_index').notNull().default(1),
  changeType: text('change_type').notNull().default('seed'),
  reason: text('reason'),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
});

export const socialGroups = pgTable('social_groups', {
  groupId: text('group_id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  groupType: text('group_type').notNull().default('social'),
  memberNpcTemplateIds: jsonb('member_npc_template_ids').$type<string[]>().notNull().default([]),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const citizenGroupRelationships = pgTable(
  'citizen_group_relationships',
  {
    citizenId: text('citizen_id')
      .notNull()
      .references(() => citizens.citizenId, { onDelete: 'cascade' }),
    groupId: text('group_id')
      .notNull()
      .references(() => socialGroups.groupId, { onDelete: 'cascade' }),
    relationshipLevel: integer('relationship_level').notNull().default(0),
    familiarity: integer('familiarity').notNull().default(0),
    relationshipScore: integer('relationship_score').notNull().default(0),
    relationshipState: text('relationship_state').notNull().default('conoscenza'),
    contactUnlocked: boolean('contact_unlocked').notNull().default(false),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.citizenId, table.groupId] })],
);

export const citizenChatThreads = pgTable('citizen_chat_threads', {
  threadId: text('thread_id').primaryKey(),
  citizenId: text('citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  counterpartType: text('counterpart_type').notNull().default('npc'),
  counterpartId: text('counterpart_id').notNull(),
  scenarioId: text('scenario_id').notNull(),
  status: text('status').notNull().default('active'),
  stepIndex: integer('step_index').notNull().default(0),
  messageCount: integer('message_count').notNull().default(0),
  context: jsonb('context').$type<Record<string, unknown>>().notNull().default({}),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  idempotencyKey: text('idempotency_key').notNull(),
});

export const citizenChatMessages = pgTable('citizen_chat_messages', {
  messageId: text('message_id').primaryKey(),
  threadId: text('thread_id')
    .notNull()
    .references(() => citizenChatThreads.threadId, { onDelete: 'cascade' }),
  speaker: text('speaker').notNull(),
  body: text('body').notNull(),
  selectedOptionId: text('selected_option_id'),
  optionSnapshot: jsonb('option_snapshot').$type<Record<string, unknown>>(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
});

export const citizenNpcSpontaneousInbox = pgTable('citizen_npc_spontaneous_inbox', {
  inboxId: text('inbox_id').primaryKey(),
  citizenId: text('citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  npcId: text('npc_id')
    .notNull()
    .references(() => npcs.npcId, { onDelete: 'cascade' }),
  scenarioId: text('scenario_id').notNull(),
  title: text('title').notNull(),
  preview: text('preview').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  idempotencyKey: text('idempotency_key').notNull(),
});

export type EconomicOwnerType = 'citizen' | 'npc' | 'system';

export type NpcSentiment = 'positive' | 'negative' | 'neutral';

export const npcs = pgTable('npcs', {
  npcId: text('npc_id').primaryKey(),
  displayName: text('display_name'),
  ageCategory: text('age_category'),
  zoneId: text('zone_id'),
  npcTemplateId: text('npc_template_id'),
  category: text('category'),
  narrativeRole: text('narrative_role'),
  occupation: text('occupation'),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Admin-assigned portrait from shared NPC pool — keyed by stable templateId. */
export const npcPortraitAssignments = pgTable('npc_portrait_assignments', {
  templateId: text('template_id').primaryKey(),
  portraitId: text('portrait_id').notNull(),
  updatedByAccountId: text('updated_by_account_id'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const citizenNpcRelationships = pgTable(
  'citizen_npc_relationships',
  {
    citizenId: text('citizen_id')
      .notNull()
      .references(() => citizens.citizenId, { onDelete: 'cascade' }),
    npcId: text('npc_id')
      .notNull()
      .references(() => npcs.npcId, { onDelete: 'cascade' }),
    relationshipLevel: integer('relationship_level').notNull().default(0),
    interactionCount: integer('interaction_count').notNull().default(0),
    lastInteractionAt: timestamp('last_interaction_at', { withTimezone: true }),
    lastOutcomeKey: text('last_outcome_key'),
    lastOutcomeSummary: text('last_outcome_summary'),
    sentiment: text('sentiment').$type<NpcSentiment>().notNull().default('neutral'),
    firstMetAt: timestamp('first_met_at', { withTimezone: true }).notNull().defaultNow(),
    trust: integer('trust').notNull().default(50),
    affection: integer('affection').notNull().default(0),
    conflict: integer('conflict').notNull().default(0),
    familiarity: integer('familiarity').notNull().default(0),
    relationshipScore: integer('relationship_score').notNull().default(0),
    relationshipState: text('relationship_state').notNull().default('conoscenza'),
    contactUnlocked: boolean('contact_unlocked').notNull().default(false),
    chatEnabled: boolean('chat_enabled').notNull().default(false),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => [primaryKey({ columns: [table.citizenId, table.npcId] })],
);

export const citizenNpcInteractions = pgTable('citizen_npc_interactions', {
  interactionId: text('interaction_id').primaryKey(),
  citizenId: text('citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  npcId: text('npc_id')
    .notNull()
    .references(() => npcs.npcId, { onDelete: 'cascade' }),
  taskInstanceId: text('task_instance_id').references(() => taskInstances.taskInstanceId, {
    onDelete: 'set null',
  }),
  definitionId: text('definition_id').notNull(),
  optionId: text('option_id').notNull(),
  outcomeKey: text('outcome_key').notNull(),
  outcomeSummary: text('outcome_summary').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
});

export const taskInstances = pgTable('task_instances', {
  taskInstanceId: text('task_instance_id').primaryKey(),
  definitionId: text('definition_id').notNull(),
  citizenId: text('citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  targetNpcId: text('target_npc_id').references(() => npcs.npcId),
  context: jsonb('context').$type<Record<string, unknown>>().notNull().default({}),
  status: text('status').notNull(),
  selectedOptionId: text('selected_option_id'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});

export type TaskInstanceStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'cancelled';

export const economicAccounts = pgTable(
  'economic_accounts',
  {
    accountId: text('account_id').primaryKey(),
    ownerType: text('owner_type').notNull(),
    ownerRef: text('owner_ref').notNull(),
    currencyId: text('currency_id').notNull().default('game_currency'),
    balanceMinor: bigint('balance_minor', { mode: 'bigint' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('economic_accounts_owner_currency_unique').on(table.ownerType, table.ownerRef, table.currencyId)],
);

export const economicTransfers = pgTable('economic_transfers', {
  transferId: text('transfer_id').primaryKey(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  sourceActionId: text('source_action_id').notNull(),
  reasonCode: text('reason_code').notNull(),
  transactionType: text('transaction_type').notNull(),
  transactionClass: text('transaction_class').notNull(),
  amountMinor: bigint('amount_minor', { mode: 'bigint' }).notNull(),
  currencyId: text('currency_id').notNull(),
  status: text('status').notNull().default('completed'),
  worldTimeMs: bigint('world_time_ms', { mode: 'bigint' }),
  correlationId: text('correlation_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const riskOutcomes = pgTable(
  'risk_outcomes',
  {
    outcomeId: text('outcome_id').primaryKey(),
    taskInstanceId: text('task_instance_id')
      .notNull()
      .references(() => taskInstances.taskInstanceId, { onDelete: 'cascade' }),
    optionId: text('option_id').notNull(),
    riskSpecRef: text('risk_spec_ref').notNull(),
    branchId: text('branch_id').notNull(),
    resolutionSeed: text('resolution_seed').notNull(),
    rollDigest: text('roll_digest').notNull(),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    correlationId: text('correlation_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('risk_outcomes_task_option_unique').on(table.taskInstanceId, table.optionId)],
);

export const economicTransferLegs = pgTable('economic_transfer_legs', {
  legId: text('leg_id').primaryKey(),
  transferId: text('transfer_id')
    .notNull()
    .references(() => economicTransfers.transferId, { onDelete: 'cascade' }),
  accountId: text('account_id')
    .notNull()
    .references(() => economicAccounts.accountId),
  direction: text('direction').notNull(),
  amountMinor: bigint('amount_minor', { mode: 'bigint' }).notNull(),
  balanceAfterMinor: bigint('balance_after_minor', { mode: 'bigint' }).notNull(),
});

export const citizenLifeEvolutionState = pgTable('citizen_life_evolution_state', {
  citizenId: text('citizen_id')
    .primaryKey()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  lastLifeReviewWorldMs: bigint('last_life_review_world_ms', { mode: 'bigint' }),
  completedTasksAtLastReview: integer('completed_tasks_at_last_review').notNull().default(0),
  lifeReviewCount: integer('life_review_count').notNull().default(0),
  employmentState: text('employment_state'),
  metadata: jsonb('metadata').notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const citizenTemporalEvents = pgTable(
  'citizen_temporal_events',
  {
    eventId: text('event_id').primaryKey(),
    citizenId: text('citizen_id')
      .notNull()
      .references(() => citizens.citizenId, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    worldTimeMs: bigint('world_time_ms', { mode: 'bigint' }).notNull(),
    realAt: timestamp('real_at', { withTimezone: true }).notNull().defaultNow(),
    status: text('status').notNull().default('applied'),
    title: text('title'),
    body: text('body'),
    payload: jsonb('payload').notNull().default({}),
  },
  (table) => ({
    citizenIdempotencyUnique: unique().on(table.citizenId, table.idempotencyKey),
  }),
);

export type FlashOpportunityStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'cancelled';

export const flashOpportunities = pgTable(
  'flash_opportunities',
  {
    opportunityId: text('opportunity_id').primaryKey(),
    citizenId: text('citizen_id')
      .notNull()
      .references(() => citizens.citizenId, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    templateId: text('template_id').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    sourceContext: jsonb('source_context').$type<Record<string, unknown>>().notNull().default({}),
    reward: jsonb('reward').$type<Record<string, unknown>>().notNull().default({}),
    risk: jsonb('risk').$type<Record<string, unknown> | null>(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    status: text('status').$type<FlashOpportunityStatus>().notNull().default('pending'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    idempotencyKey: text('idempotency_key').notNull(),
  },
  (table) => ({
    citizenIdempotencyUnique: unique().on(table.citizenId, table.idempotencyKey),
  }),
);

export const citizenFlashSpawnState = pgTable('citizen_flash_spawn_state', {
  citizenId: text('citizen_id')
    .primaryKey()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  spawnCycle: integer('spawn_cycle').notNull().default(0),
  anticipationStartedAt: timestamp('anticipation_started_at', { withTimezone: true }),
  anticipationDurationMs: integer('anticipation_duration_ms'),
  anticipationLabel: text('anticipation_label'),
  nextSpawnEligibleAt: timestamp('next_spawn_eligible_at', { withTimezone: true }),
  lastOpportunityAt: timestamp('last_opportunity_at', { withTimezone: true }),
  lastExpiredNotice: text('last_expired_notice'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const worldEvents = pgTable('world_events', {
  eventId: text('event_id').primaryKey(),
  templateId: text('template_id').notNull(),
  scope: text('scope').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  severity: text('severity').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  comuneLine: text('comune_line'),
  source: text('source').notNull().default('system'),
  startedAtGameMs: bigint('started_at_game_ms', { mode: 'bigint' }).notNull(),
  endsAtGameMs: bigint('ends_at_game_ms', { mode: 'bigint' }).notNull(),
  effects: jsonb('effects').$type<Record<string, unknown>>().notNull().default({}),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  zoneId: text('zone_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const worldEventSchedulerState = pgTable('world_event_scheduler_state', {
  id: integer('id').primaryKey().default(1),
  lastEvaluatedGameMs: bigint('last_evaluated_game_ms', { mode: 'bigint' }).notNull().default(0n),
  spawnCycle: integer('spawn_cycle').notNull().default(0),
  lastSpawnedGameMs: bigint('last_spawned_game_ms', { mode: 'bigint' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const citizenWorldEventNotices = pgTable(
  'citizen_world_event_notices',
  {
    citizenId: text('citizen_id')
      .notNull()
      .references(() => citizens.citizenId, { onDelete: 'cascade' }),
    worldEventId: text('world_event_id')
      .notNull()
      .references(() => worldEvents.eventId, { onDelete: 'cascade' }),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    noticedAt: timestamp('noticed_at', { withTimezone: true }).notNull().defaultNow(),
    popupDismissedAt: timestamp('popup_dismissed_at', { withTimezone: true }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.citizenId, table.worldEventId] }),
  }),
);

export const storyThreads = pgTable('story_threads', {
  threadId: text('thread_id').primaryKey(),
  citizenId: text('citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  status: text('status').notNull(),
  origin: text('origin').notNull(),
  stage: integer('stage').notNull().default(1),
  priority: doublePrecision('priority').notNull().default(1),
  createdAtGameMs: bigint('created_at_game_ms', { mode: 'bigint' }).notNull(),
  lastActivityGameMs: bigint('last_activity_game_ms', { mode: 'bigint' }).notNull(),
  dormantUntilGameMs: bigint('dormant_until_game_ms', { mode: 'bigint' }),
  expiresAtGameMs: bigint('expires_at_game_ms', { mode: 'bigint' }),
  context: jsonb('context').$type<Record<string, unknown>>().notNull().default({}),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  idempotencyKey: text('idempotency_key').notNull().unique(),
});

export const municipalityState = pgTable('municipality_state', {
  id: integer('id').primaryKey().default(1),
  treasuryMinor: bigint('treasury_minor', { mode: 'bigint' }).notNull().default(0n),
  inflationRateBps: integer('inflation_rate_bps').notNull().default(200),
  priceIndexBps: integer('price_index_bps').notNull().default(10000),
  lastInflationTickGameMs: bigint('last_inflation_tick_game_ms', { mode: 'bigint' })
    .notNull()
    .default(0n),
  citizenCount: integer('citizen_count').notNull().default(0),
  updatedAtGameMs: bigint('updated_at_game_ms', { mode: 'bigint' }).notNull().default(0n),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
});

export const municipalityInflationHistory = pgTable('municipality_inflation_history', {
  snapshotId: text('snapshot_id').primaryKey(),
  recordedAtGameMs: bigint('recorded_at_game_ms', { mode: 'bigint' }).notNull(),
  inflationRateBps: integer('inflation_rate_bps').notNull(),
  priceIndexBps: integer('price_index_bps').notNull().default(10000),
  treasuryMinor: bigint('treasury_minor', { mode: 'bigint' }).notNull(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
});

export const municipalityChronicle = pgTable('municipality_chronicle', {
  entryId: text('entry_id').primaryKey(),
  recordedAtGameMs: bigint('recorded_at_game_ms', { mode: 'bigint' }).notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
});

export const businesses = pgTable('businesses', {
  businessId: text('business_id').primaryKey(),
  name: text('name').notNull(),
  sector: text('sector').notNull(),
  description: text('description').notNull(),
  ownerCitizenId: text('owner_citizen_id').references(() => citizens.citizenId, {
    onDelete: 'set null',
  }),
  treasuryMinor: bigint('treasury_minor', { mode: 'bigint' }).notNull().default(0n),
  employeeCount: integer('employee_count').notNull().default(0),
  enabled: boolean('enabled').notNull().default(true),
});

export const referendums = pgTable('referendums', {
  referendumId: text('referendum_id').primaryKey(),
  question: text('question').notNull(),
  context: text('context').notNull(),
  status: text('status').notNull(),
  optionALabel: text('option_a_label').notNull(),
  optionBLabel: text('option_b_label').notNull(),
  optionAVotes: integer('option_a_votes').notNull().default(0),
  optionBVotes: integer('option_b_votes').notNull().default(0),
  startsAtGameMs: bigint('starts_at_game_ms', { mode: 'bigint' }).notNull(),
  endsAtGameMs: bigint('ends_at_game_ms', { mode: 'bigint' }).notNull(),
  closedAtGameMs: bigint('closed_at_game_ms', { mode: 'bigint' }),
  winningOption: text('winning_option'),
  consequenceSummary: text('consequence_summary'),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
});

export const referendumVotes = pgTable(
  'referendum_votes',
  {
    voteId: text('vote_id').primaryKey(),
    referendumId: text('referendum_id')
      .notNull()
      .references(() => referendums.referendumId, { onDelete: 'cascade' }),
    citizenId: text('citizen_id')
      .notNull()
      .references(() => citizens.citizenId, { onDelete: 'cascade' }),
    optionId: text('option_id').notNull(),
    votedAtGameMs: bigint('voted_at_game_ms', { mode: 'bigint' }).notNull(),
    idempotencyKey: text('idempotency_key').notNull().unique(),
  },
  (table) => [unique('referendum_votes_referendum_citizen_unique').on(table.referendumId, table.citizenId)],
);

export const marketplaceCatalog = pgTable('marketplace_catalog', {
  itemId: text('item_id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  priceMinor: bigint('price_minor', { mode: 'bigint' }).notNull(),
  effectKey: text('effect_key'),
  enabled: boolean('enabled').notNull().default(true),
});

export const citizenInventory = pgTable('citizen_inventory', {
  inventoryId: text('inventory_id').primaryKey(),
  citizenId: text('citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  itemId: text('item_id')
    .notNull()
    .references(() => marketplaceCatalog.itemId),
  acquiredAtGameMs: bigint('acquired_at_game_ms', { mode: 'bigint' }).notNull(),
  purchasePriceMinor: bigint('purchase_price_minor', { mode: 'bigint' }),
  purchasePriceIndexBps: integer('purchase_price_index_bps'),
  idempotencyKey: text('idempotency_key').notNull().unique(),
});

export const jobOffers = pgTable('job_offers', {
  offerId: text('offer_id').primaryKey(),
  title: text('title').notNull(),
  employer: text('employer').notNull(),
  description: text('description').notNull(),
  occupationCode: integer('occupation_code').notNull(),
  salaryHintMinor: bigint('salary_hint_minor', { mode: 'bigint' }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
});

export const citizenRentals = pgTable('citizen_rentals', {
  rentalId: text('rental_id').primaryKey(),
  tenantCitizenId: text('tenant_citizen_id').references(() => citizens.citizenId, { onDelete: 'cascade' }),
  tenantNpcId: text('tenant_npc_id'),
  ownerCitizenId: text('owner_citizen_id').references(() => citizens.citizenId),
  itemId: text('item_id')
    .notNull()
    .references(() => marketplaceCatalog.itemId),
  listingId: text('listing_id'),
  startedAtGameMs: bigint('started_at_game_ms', { mode: 'bigint' }).notNull(),
  expiresAtGameMs: bigint('expires_at_game_ms', { mode: 'bigint' }).notNull(),
  monthlyRentMinor: bigint('monthly_rent_minor', { mode: 'bigint' }),
  status: text('status').notNull().default('active'),
  idempotencyKey: text('idempotency_key').notNull().unique(),
});

export const citizenEmployment = pgTable('citizen_employment', {
  citizenId: text('citizen_id')
    .primaryKey()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  employmentState: text('employment_state').notNull().default('unemployed'),
  currentOfferId: text('current_offer_id').references(() => jobOffers.offerId),
  hiredAtGameMs: bigint('hired_at_game_ms', { mode: 'bigint' }),
  updatedAtGameMs: bigint('updated_at_game_ms', { mode: 'bigint' }).notNull().default(0n),
});

export const citizenMessages = pgTable('citizen_messages', {
  messageId: text('message_id').primaryKey(),
  fromCitizenId: text('from_citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  toCitizenId: text('to_citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  sentAtGameMs: bigint('sent_at_game_ms', { mode: 'bigint' }).notNull(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
});

export const citizenEconomicSnapshots = pgTable('citizen_economic_snapshots', {
  snapshotId: text('snapshot_id').primaryKey(),
  citizenId: text('citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  recordedAtGameMs: bigint('recorded_at_game_ms', { mode: 'bigint' }).notNull(),
  cashMinor: bigint('cash_minor', { mode: 'bigint' }).notNull(),
  inventoryValueMinor: bigint('inventory_value_minor', { mode: 'bigint' }).notNull().default(0n),
  netWorthMinor: bigint('net_worth_minor', { mode: 'bigint' }).notNull(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
});

export const citizenJobApplications = pgTable('citizen_job_applications', {
  applicationId: text('application_id').primaryKey(),
  citizenId: text('citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  offerId: text('offer_id')
    .notNull()
    .references(() => jobOffers.offerId),
  decision: text('decision').notNull(),
  decidedAtGameMs: bigint('decided_at_game_ms', { mode: 'bigint' }).notNull(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
});

export const citizenJobEngagements = pgTable(
  'citizen_job_engagements',
  {
    citizenId: text('citizen_id')
      .notNull()
      .references(() => citizens.citizenId, { onDelete: 'cascade' }),
    offerId: text('offer_id')
      .notNull()
      .references(() => jobOffers.offerId),
    status: text('status').notNull(),
    hiredAtGameMs: bigint('hired_at_game_ms', { mode: 'bigint' }),
    shiftStartedAtGameMs: bigint('shift_started_at_game_ms', { mode: 'bigint' }),
    shiftEndsAtGameMs: bigint('shift_ends_at_game_ms', { mode: 'bigint' }),
    blockedUntilGameMs: bigint('blocked_until_game_ms', { mode: 'bigint' }),
    lastApplicationId: text('last_application_id').references(
      () => citizenJobApplications.applicationId,
    ),
    updatedAtGameMs: bigint('updated_at_game_ms', { mode: 'bigint' }).notNull().default(0n),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.citizenId, table.offerId] }),
  }),
);

export const marketplacePlayerListings = pgTable('marketplace_player_listings', {
  listingId: text('listing_id').primaryKey(),
  sellerCitizenId: text('seller_citizen_id')
    .notNull()
    .references(() => citizens.citizenId, { onDelete: 'cascade' }),
  inventoryId: text('inventory_id')
    .notNull()
    .references(() => citizenInventory.inventoryId, { onDelete: 'cascade' }),
  itemId: text('item_id')
    .notNull()
    .references(() => marketplaceCatalog.itemId),
  listingType: text('listing_type').notNull().default('sale'),
  priceMinor: bigint('price_minor', { mode: 'bigint' }).notNull(),
  listedAtGameMs: bigint('listed_at_game_ms', { mode: 'bigint' }).notNull(),
  expiresAtGameMs: bigint('expires_at_game_ms', { mode: 'bigint' }),
  status: text('status').notNull().default('active'),
  buyerCitizenId: text('buyer_citizen_id').references(() => citizens.citizenId),
  buyerNpcId: text('buyer_npc_id'),
  soldAtGameMs: bigint('sold_at_game_ms', { mode: 'bigint' }),
  npcResolveAfterGameMs: bigint('npc_resolve_after_game_ms', { mode: 'bigint' }),
  idempotencyKey: text('idempotency_key').notNull().unique(),
});
