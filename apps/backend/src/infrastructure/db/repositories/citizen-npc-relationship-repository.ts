import { and, desc, eq } from 'drizzle-orm';
import type { Database } from '../client.js';
import {
  citizenNpcInteractions,
  citizenNpcRelationships,
  npcs,
} from '../schema/index.js';
import type {
  CitizenNpcInteractionRecord,
  CitizenNpcRelationshipRecord,
  CitizenNpcRelationshipRepository,
  NpcRecord,
} from '../../../domain/ports/repositories.js';
import {
  clampMetric,
  computeRelationshipScore,
  resolveRelationshipState,
} from '../../../slice/relationship-state-resolver.js';

function mapNpc(row: typeof npcs.$inferSelect): NpcRecord {
  return {
    npcId: row.npcId,
    displayName: row.displayName,
    ageCategory: row.ageCategory,
    zoneId: row.zoneId,
    npcTemplateId: row.npcTemplateId,
    category: row.category,
    narrativeRole: row.narrativeRole,
    occupation: row.occupation,
    isActive: row.isActive,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.createdAt,
  };
}

function mapRelationship(row: typeof citizenNpcRelationships.$inferSelect): CitizenNpcRelationshipRecord {
  return {
    citizenId: row.citizenId,
    npcId: row.npcId,
    relationshipLevel: row.relationshipLevel,
    interactionCount: row.interactionCount,
    lastInteractionAt: row.lastInteractionAt,
    lastOutcomeKey: row.lastOutcomeKey,
    lastOutcomeSummary: row.lastOutcomeSummary,
    sentiment: row.sentiment,
    firstMetAt: row.firstMetAt,
    trust: row.trust ?? 50,
    affection: row.affection ?? 0,
    conflict: row.conflict ?? 0,
    familiarity: row.familiarity ?? 0,
    relationshipScore: row.relationshipScore ?? 0,
    relationshipState: row.relationshipState ?? 'conoscenza',
    contactUnlocked: row.contactUnlocked ?? false,
    chatEnabled: row.chatEnabled ?? false,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  };
}

function resolveMetrics(input: {
  trust: number;
  affection: number;
  conflict: number;
  familiarity: number;
  relationshipLevel: number;
  contactUnlocked: boolean;
}): {
  relationshipScore: number;
  relationshipState: string;
} {
  const trust = clampMetric(input.trust);
  const affection = clampMetric(input.affection);
  const conflict = clampMetric(input.conflict);
  const familiarity = clampMetric(input.familiarity);
  const relationshipScore = computeRelationshipScore({
    trust,
    affection,
    familiarity,
    conflict,
    relationshipLevel: input.relationshipLevel,
  });
  const relationshipState = resolveRelationshipState({
    trust,
    affection,
    conflict,
    familiarity,
    relationshipLevel: input.relationshipLevel,
    contactUnlocked: input.contactUnlocked,
  });
  return { relationshipScore, relationshipState };
}

export class DrizzleCitizenNpcRelationshipRepository implements CitizenNpcRelationshipRepository {
  constructor(private readonly db: Database) {}

  async findByCitizenAndNpc(
    citizenId: string,
    npcId: string,
  ): Promise<CitizenNpcRelationshipRecord | null> {
    const rows = await this.db
      .select()
      .from(citizenNpcRelationships)
      .where(
        and(
          eq(citizenNpcRelationships.citizenId, citizenId),
          eq(citizenNpcRelationships.npcId, npcId),
        ),
      )
      .limit(1);
    const row = rows[0];
    return row ? mapRelationship(row) : null;
  }

  async findKnownByCitizen(
    citizenId: string,
  ): Promise<Array<CitizenNpcRelationshipRecord & { npc: NpcRecord }>> {
    const rows = await this.db
      .select({ relationship: citizenNpcRelationships, npc: npcs })
      .from(citizenNpcRelationships)
      .innerJoin(npcs, eq(citizenNpcRelationships.npcId, npcs.npcId))
      .where(eq(citizenNpcRelationships.citizenId, citizenId))
      .orderBy(desc(citizenNpcRelationships.lastInteractionAt));

    return rows.map((row) => ({
      ...mapRelationship(row.relationship),
      npc: mapNpc(row.npc),
    }));
  }

  async findKnownByTemplate(
    citizenId: string,
    npcTemplateId: string,
  ): Promise<(CitizenNpcRelationshipRecord & { npc: NpcRecord }) | null> {
    const rows = await this.db
      .select({ relationship: citizenNpcRelationships, npc: npcs })
      .from(citizenNpcRelationships)
      .innerJoin(npcs, eq(citizenNpcRelationships.npcId, npcs.npcId))
      .where(
        and(
          eq(citizenNpcRelationships.citizenId, citizenId),
          eq(npcs.npcTemplateId, npcTemplateId),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
      ...mapRelationship(row.relationship),
      npc: mapNpc(row.npc),
    };
  }

  async upsertRelationship(input: {
    citizenId: string;
    npcId: string;
    relationshipLevel: number;
    interactionCount: number;
    lastInteractionAt: Date;
    lastOutcomeKey: string;
    lastOutcomeSummary: string;
    sentiment: CitizenNpcRelationshipRecord['sentiment'];
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
  }): Promise<CitizenNpcRelationshipRecord> {
    const existing = await this.findByCitizenAndNpc(input.citizenId, input.npcId);

    const trust = input.trust ?? existing?.trust ?? 50;
    const affection = input.affection ?? existing?.affection ?? 0;
    const conflict = input.conflict ?? existing?.conflict ?? 0;
    const familiarity = input.familiarity ?? existing?.familiarity ?? 0;
    const contactUnlocked = input.contactUnlocked ?? existing?.contactUnlocked ?? false;
    const chatEnabled = input.chatEnabled ?? existing?.chatEnabled ?? contactUnlocked;
    const metrics = resolveMetrics({
      trust,
      affection,
      conflict,
      familiarity,
      relationshipLevel: input.relationshipLevel,
      contactUnlocked,
    });

    if (existing) {
      const rows = await this.db
        .update(citizenNpcRelationships)
        .set({
          relationshipLevel: input.relationshipLevel,
          interactionCount: input.interactionCount,
          lastInteractionAt: input.lastInteractionAt,
          lastOutcomeKey: input.lastOutcomeKey,
          lastOutcomeSummary: input.lastOutcomeSummary,
          sentiment: input.sentiment,
          trust,
          affection,
          conflict,
          familiarity,
          relationshipScore: input.relationshipScore ?? metrics.relationshipScore,
          relationshipState: input.relationshipState ?? metrics.relationshipState,
          contactUnlocked,
          chatEnabled,
          metadata: input.metadata ?? existing.metadata,
        })
        .where(
          and(
            eq(citizenNpcRelationships.citizenId, input.citizenId),
            eq(citizenNpcRelationships.npcId, input.npcId),
          ),
        )
        .returning();
      return mapRelationship(rows[0]!);
    }

    const rows = await this.db
      .insert(citizenNpcRelationships)
      .values({
        citizenId: input.citizenId,
        npcId: input.npcId,
        relationshipLevel: input.relationshipLevel,
        interactionCount: input.interactionCount,
        lastInteractionAt: input.lastInteractionAt,
        lastOutcomeKey: input.lastOutcomeKey,
        lastOutcomeSummary: input.lastOutcomeSummary,
        sentiment: input.sentiment,
        firstMetAt: input.firstMetAt ?? input.lastInteractionAt,
        trust,
        affection,
        conflict,
        familiarity,
        relationshipScore: input.relationshipScore ?? metrics.relationshipScore,
        relationshipState: input.relationshipState ?? metrics.relationshipState,
        contactUnlocked,
        chatEnabled,
        metadata: input.metadata ?? {},
      })
      .returning();

    return mapRelationship(rows[0]!);
  }

  async applyRelationshipMetrics(input: {
    citizenId: string;
    npcId: string;
    trust?: number;
    affection?: number;
    conflict?: number;
    familiarity?: number;
    unlockContact?: boolean;
    enableChat?: boolean;
  }): Promise<CitizenNpcRelationshipRecord | null> {
    const existing = await this.findByCitizenAndNpc(input.citizenId, input.npcId);
    if (!existing) return null;

    const trust = clampMetric(existing.trust + (input.trust ?? 0));
    const affection = clampMetric(existing.affection + (input.affection ?? 0));
    const conflict = clampMetric(existing.conflict + (input.conflict ?? 0));
    const familiarity = clampMetric(existing.familiarity + (input.familiarity ?? 0));
    const contactUnlocked = input.unlockContact ? true : existing.contactUnlocked;
    const chatEnabled = input.enableChat ? true : existing.chatEnabled || contactUnlocked;
    const metrics = resolveMetrics({
      trust,
      affection,
      conflict,
      familiarity,
      relationshipLevel: existing.relationshipLevel,
      contactUnlocked,
    });

    const rows = await this.db
      .update(citizenNpcRelationships)
      .set({
        trust,
        affection,
        conflict,
        familiarity,
        relationshipScore: metrics.relationshipScore,
        relationshipState: metrics.relationshipState,
        contactUnlocked,
        chatEnabled,
      })
      .where(
        and(
          eq(citizenNpcRelationships.citizenId, input.citizenId),
          eq(citizenNpcRelationships.npcId, input.npcId),
        ),
      )
      .returning();

    return rows[0] ? mapRelationship(rows[0]) : null;
  }

  async recordInteraction(input: {
    interactionId: string;
    citizenId: string;
    npcId: string;
    taskInstanceId: string | null;
    definitionId: string;
    optionId: string;
    outcomeKey: string;
    outcomeSummary: string;
    occurredAt: Date;
  }): Promise<CitizenNpcInteractionRecord> {
    const rows = await this.db
      .insert(citizenNpcInteractions)
      .values({
        interactionId: input.interactionId,
        citizenId: input.citizenId,
        npcId: input.npcId,
        taskInstanceId: input.taskInstanceId,
        definitionId: input.definitionId,
        optionId: input.optionId,
        outcomeKey: input.outcomeKey,
        outcomeSummary: input.outcomeSummary,
        occurredAt: input.occurredAt,
      })
      .returning();

    const row = rows[0]!;
    return {
      interactionId: row.interactionId,
      citizenId: row.citizenId,
      npcId: row.npcId,
      taskInstanceId: row.taskInstanceId,
      definitionId: row.definitionId,
      optionId: row.optionId,
      outcomeKey: row.outcomeKey,
      outcomeSummary: row.outcomeSummary,
      occurredAt: row.occurredAt,
    };
  }

  async listInteractions(citizenId: string, npcId: string): Promise<CitizenNpcInteractionRecord[]> {
    const rows = await this.db
      .select()
      .from(citizenNpcInteractions)
      .where(
        and(
          eq(citizenNpcInteractions.citizenId, citizenId),
          eq(citizenNpcInteractions.npcId, npcId),
        ),
      )
      .orderBy(desc(citizenNpcInteractions.occurredAt));

    return rows.map((row) => ({
      interactionId: row.interactionId,
      citizenId: row.citizenId,
      npcId: row.npcId,
      taskInstanceId: row.taskInstanceId,
      definitionId: row.definitionId,
      optionId: row.optionId,
      outcomeKey: row.outcomeKey,
      outcomeSummary: row.outcomeSummary,
      occurredAt: row.occurredAt,
    }));
  }
}
