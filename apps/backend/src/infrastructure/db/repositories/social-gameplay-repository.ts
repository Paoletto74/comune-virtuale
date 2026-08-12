import { and, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Database } from '../client.js';
import {
  citizenChatMessages,
  citizenChatThreads,
  citizenGroupRelationships,
  citizenNpcSpontaneousInbox,
  socialGroups,
} from '../schema/index.js';

export interface SocialGroupRecord {
  groupId: string;
  name: string;
  description: string;
  groupType: string;
  memberNpcTemplateIds: string[];
  metadata: Record<string, unknown>;
}

export interface CitizenGroupRelationshipRecord {
  citizenId: string;
  groupId: string;
  relationshipLevel: number;
  familiarity: number;
  relationshipScore: number;
  relationshipState: string;
  contactUnlocked: boolean;
  metadata: Record<string, unknown>;
  updatedAt: Date;
}

export interface ChatThreadRecord {
  threadId: string;
  citizenId: string;
  counterpartType: string;
  counterpartId: string;
  scenarioId: string;
  status: string;
  stepIndex: number;
  messageCount: number;
  context: Record<string, unknown>;
  startedAt: Date;
  lastMessageAt: Date;
  endedAt: Date | null;
  idempotencyKey: string;
}

export interface ChatMessageRecord {
  messageId: string;
  threadId: string;
  speaker: string;
  body: string;
  selectedOptionId: string | null;
  optionSnapshot: Record<string, unknown> | null;
  recordedAt: Date;
}

export interface SpontaneousInboxRecord {
  inboxId: string;
  citizenId: string;
  npcId: string;
  scenarioId: string;
  title: string;
  preview: string;
  status: string;
  createdAt: Date;
  expiresAt: Date | null;
  idempotencyKey: string;
}

export class DrizzleSocialGameplayRepository {
  constructor(private readonly db: Database) {}

  async listGroups(): Promise<SocialGroupRecord[]> {
    const rows = await this.db.select().from(socialGroups);
    return rows.map((row) => ({
      groupId: row.groupId,
      name: row.name,
      description: row.description,
      groupType: row.groupType,
      memberNpcTemplateIds: (row.memberNpcTemplateIds ?? []) as string[],
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
    }));
  }

  async listGroupRelationships(citizenId: string): Promise<CitizenGroupRelationshipRecord[]> {
    const rows = await this.db
      .select()
      .from(citizenGroupRelationships)
      .where(eq(citizenGroupRelationships.citizenId, citizenId));
    return rows.map((row) => ({
      citizenId: row.citizenId,
      groupId: row.groupId,
      relationshipLevel: row.relationshipLevel,
      familiarity: row.familiarity,
      relationshipScore: row.relationshipScore,
      relationshipState: row.relationshipState,
      contactUnlocked: row.contactUnlocked,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
      updatedAt: row.updatedAt,
    }));
  }

  async upsertGroupRelationship(input: {
    citizenId: string;
    groupId: string;
    relationshipLevel?: number;
    familiarity?: number;
    relationshipScore?: number;
    relationshipState?: string;
    contactUnlocked?: boolean;
  }): Promise<CitizenGroupRelationshipRecord> {
    const existing = await this.db
      .select()
      .from(citizenGroupRelationships)
      .where(
        and(
          eq(citizenGroupRelationships.citizenId, input.citizenId),
          eq(citizenGroupRelationships.groupId, input.groupId),
        ),
      )
      .limit(1);

    if (existing[0]) {
      const rows = await this.db
        .update(citizenGroupRelationships)
        .set({
          ...(input.relationshipLevel !== undefined ? { relationshipLevel: input.relationshipLevel } : {}),
          ...(input.familiarity !== undefined ? { familiarity: input.familiarity } : {}),
          ...(input.relationshipScore !== undefined ? { relationshipScore: input.relationshipScore } : {}),
          ...(input.relationshipState !== undefined ? { relationshipState: input.relationshipState } : {}),
          ...(input.contactUnlocked !== undefined ? { contactUnlocked: input.contactUnlocked } : {}),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(citizenGroupRelationships.citizenId, input.citizenId),
            eq(citizenGroupRelationships.groupId, input.groupId),
          ),
        )
        .returning();
      const row = rows[0]!;
      return {
        citizenId: row.citizenId,
        groupId: row.groupId,
        relationshipLevel: row.relationshipLevel,
        familiarity: row.familiarity,
        relationshipScore: row.relationshipScore,
        relationshipState: row.relationshipState,
        contactUnlocked: row.contactUnlocked,
        metadata: (row.metadata ?? {}) as Record<string, unknown>,
        updatedAt: row.updatedAt,
      };
    }

    const rows = await this.db
      .insert(citizenGroupRelationships)
      .values({
        citizenId: input.citizenId,
        groupId: input.groupId,
        relationshipLevel: input.relationshipLevel ?? 0,
        familiarity: input.familiarity ?? 0,
        relationshipScore: input.relationshipScore ?? 0,
        relationshipState: input.relationshipState ?? 'conoscenza',
        contactUnlocked: input.contactUnlocked ?? false,
      })
      .returning();
    const row = rows[0]!;
    return {
      citizenId: row.citizenId,
      groupId: row.groupId,
      relationshipLevel: row.relationshipLevel,
      familiarity: row.familiarity,
      relationshipScore: row.relationshipScore,
      relationshipState: row.relationshipState,
      contactUnlocked: row.contactUnlocked,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
      updatedAt: row.updatedAt,
    };
  }

  async findThreadById(threadId: string): Promise<ChatThreadRecord | null> {
    const rows = await this.db
      .select()
      .from(citizenChatThreads)
      .where(eq(citizenChatThreads.threadId, threadId))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapThread(row);
  }

  async findActiveThread(input: {
    citizenId: string;
    counterpartId: string;
    scenarioId: string;
  }): Promise<ChatThreadRecord | null> {
    const rows = await this.db
      .select()
      .from(citizenChatThreads)
      .where(
        and(
          eq(citizenChatThreads.citizenId, input.citizenId),
          eq(citizenChatThreads.counterpartId, input.counterpartId),
          eq(citizenChatThreads.scenarioId, input.scenarioId),
          eq(citizenChatThreads.status, 'active'),
        ),
      )
      .orderBy(desc(citizenChatThreads.lastMessageAt))
      .limit(1);
    const row = rows[0];
    return row ? this.mapThread(row) : null;
  }

  async createThread(input: {
    citizenId: string;
    counterpartId: string;
    scenarioId: string;
    idempotencyKey: string;
    context?: Record<string, unknown>;
  }): Promise<{ thread: ChatThreadRecord; created: boolean }> {
    const existing = await this.db
      .select()
      .from(citizenChatThreads)
      .where(
        and(
          eq(citizenChatThreads.citizenId, input.citizenId),
          eq(citizenChatThreads.idempotencyKey, input.idempotencyKey),
        ),
      )
      .limit(1);

    if (existing[0]) {
      return { thread: this.mapThread(existing[0]), created: false };
    }

    const threadId = randomUUID();
    const now = new Date();
    const rows = await this.db
      .insert(citizenChatThreads)
      .values({
        threadId,
        citizenId: input.citizenId,
        counterpartType: 'npc',
        counterpartId: input.counterpartId,
        scenarioId: input.scenarioId,
        status: 'active',
        stepIndex: 0,
        messageCount: 0,
        context: input.context ?? {},
        startedAt: now,
        lastMessageAt: now,
        idempotencyKey: input.idempotencyKey,
      })
      .returning();

    return { thread: this.mapThread(rows[0]!), created: true };
  }

  async updateThread(input: {
    threadId: string;
    stepIndex?: number;
    messageCount?: number;
    status?: string;
    context?: Record<string, unknown>;
    endedAt?: Date | null;
  }): Promise<ChatThreadRecord> {
    const rows = await this.db
      .update(citizenChatThreads)
      .set({
        ...(input.stepIndex !== undefined ? { stepIndex: input.stepIndex } : {}),
        ...(input.messageCount !== undefined ? { messageCount: input.messageCount } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.context !== undefined ? { context: input.context } : {}),
        ...(input.endedAt !== undefined ? { endedAt: input.endedAt } : {}),
        lastMessageAt: new Date(),
      })
      .where(eq(citizenChatThreads.threadId, input.threadId))
      .returning();
    return this.mapThread(rows[0]!);
  }

  async appendMessage(input: {
    threadId: string;
    speaker: string;
    body: string;
    selectedOptionId?: string;
    optionSnapshot?: Record<string, unknown>;
  }): Promise<ChatMessageRecord> {
    const messageId = randomUUID();
    const rows = await this.db
      .insert(citizenChatMessages)
      .values({
        messageId,
        threadId: input.threadId,
        speaker: input.speaker,
        body: input.body,
        selectedOptionId: input.selectedOptionId ?? null,
        optionSnapshot: input.optionSnapshot ?? null,
      })
      .returning();
    const row = rows[0]!;
    return {
      messageId: row.messageId,
      threadId: row.threadId,
      speaker: row.speaker,
      body: row.body,
      selectedOptionId: row.selectedOptionId,
      optionSnapshot: (row.optionSnapshot ?? null) as Record<string, unknown> | null,
      recordedAt: row.recordedAt,
    };
  }

  async listMessages(threadId: string): Promise<ChatMessageRecord[]> {
    const rows = await this.db
      .select()
      .from(citizenChatMessages)
      .where(eq(citizenChatMessages.threadId, threadId))
      .orderBy(citizenChatMessages.recordedAt);
    return rows.map((row) => ({
      messageId: row.messageId,
      threadId: row.threadId,
      speaker: row.speaker,
      body: row.body,
      selectedOptionId: row.selectedOptionId,
      optionSnapshot: (row.optionSnapshot ?? null) as Record<string, unknown> | null,
      recordedAt: row.recordedAt,
    }));
  }

  async createSpontaneousInbox(input: {
    citizenId: string;
    npcId: string;
    scenarioId: string;
    title: string;
    preview: string;
    idempotencyKey: string;
    expiresAt?: Date;
  }): Promise<{ record: SpontaneousInboxRecord; created: boolean }> {
    const existing = await this.db
      .select()
      .from(citizenNpcSpontaneousInbox)
      .where(
        and(
          eq(citizenNpcSpontaneousInbox.citizenId, input.citizenId),
          eq(citizenNpcSpontaneousInbox.idempotencyKey, input.idempotencyKey),
        ),
      )
      .limit(1);

    if (existing[0]) {
      return { record: this.mapInbox(existing[0]), created: false };
    }

    const inboxId = randomUUID();
    const rows = await this.db
      .insert(citizenNpcSpontaneousInbox)
      .values({
        inboxId,
        citizenId: input.citizenId,
        npcId: input.npcId,
        scenarioId: input.scenarioId,
        title: input.title,
        preview: input.preview,
        idempotencyKey: input.idempotencyKey,
        expiresAt: input.expiresAt ?? null,
      })
      .returning();

    return { record: this.mapInbox(rows[0]!), created: true };
  }

  async listPendingSpontaneous(citizenId: string): Promise<SpontaneousInboxRecord[]> {
    const rows = await this.db
      .select()
      .from(citizenNpcSpontaneousInbox)
      .where(
        and(
          eq(citizenNpcSpontaneousInbox.citizenId, citizenId),
          eq(citizenNpcSpontaneousInbox.status, 'pending'),
        ),
      )
      .orderBy(desc(citizenNpcSpontaneousInbox.createdAt));
    return rows.map((row) => this.mapInbox(row));
  }

  async markSpontaneousStatus(inboxId: string, status: string): Promise<void> {
    await this.db
      .update(citizenNpcSpontaneousInbox)
      .set({ status })
      .where(eq(citizenNpcSpontaneousInbox.inboxId, inboxId));
  }

  private mapThread(row: typeof citizenChatThreads.$inferSelect): ChatThreadRecord {
    return {
      threadId: row.threadId,
      citizenId: row.citizenId,
      counterpartType: row.counterpartType,
      counterpartId: row.counterpartId,
      scenarioId: row.scenarioId,
      status: row.status,
      stepIndex: row.stepIndex,
      messageCount: row.messageCount,
      context: (row.context ?? {}) as Record<string, unknown>,
      startedAt: row.startedAt,
      lastMessageAt: row.lastMessageAt,
      endedAt: row.endedAt,
      idempotencyKey: row.idempotencyKey,
    };
  }

  private mapInbox(row: typeof citizenNpcSpontaneousInbox.$inferSelect): SpontaneousInboxRecord {
    return {
      inboxId: row.inboxId,
      citizenId: row.citizenId,
      npcId: row.npcId,
      scenarioId: row.scenarioId,
      title: row.title,
      preview: row.preview,
      status: row.status,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      idempotencyKey: row.idempotencyKey,
    };
  }
}
