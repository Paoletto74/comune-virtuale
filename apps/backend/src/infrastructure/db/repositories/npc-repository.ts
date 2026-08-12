import { and, eq } from 'drizzle-orm';
import type { Database } from '../client.js';
import { citizenNpcRelationships, npcs } from '../schema/index.js';
import type { NpcRecord, NpcRepository } from '../../../domain/ports/repositories.js';

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

export class DrizzleNpcRepository implements NpcRepository {
  constructor(private readonly db: Database) {}

  async findById(npcId: string): Promise<NpcRecord | null> {
    const rows = await this.db.select().from(npcs).where(eq(npcs.npcId, npcId)).limit(1);
    const row = rows[0];
    return row ? mapNpc(row) : null;
  }

  async create(input: {
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
  }): Promise<NpcRecord> {
    const rows = await this.db
      .insert(npcs)
      .values({
        npcId: input.npcId,
        displayName: input.displayName ?? null,
        ageCategory: input.ageCategory ?? null,
        zoneId: input.zoneId ?? null,
        npcTemplateId: input.npcTemplateId ?? null,
        category: input.category ?? null,
        narrativeRole: input.narrativeRole ?? null,
        occupation: input.occupation ?? null,
        isActive: input.isActive ?? true,
        metadata: input.metadata ?? {},
      })
      .returning();

    return mapNpc(rows[0]!);
  }

  async findByCitizenAndTemplate(citizenId: string, npcTemplateId: string): Promise<NpcRecord | null> {
    const rows = await this.db
      .select({ npc: npcs })
      .from(npcs)
      .innerJoin(citizenNpcRelationships, eq(citizenNpcRelationships.npcId, npcs.npcId))
      .where(
        and(
          eq(citizenNpcRelationships.citizenId, citizenId),
          eq(npcs.npcTemplateId, npcTemplateId),
        ),
      )
      .limit(1);

    const row = rows[0];
    return row ? mapNpc(row.npc) : null;
  }
}
