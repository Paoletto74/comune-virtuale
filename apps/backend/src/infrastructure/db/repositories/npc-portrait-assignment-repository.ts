import { eq } from 'drizzle-orm';
import type { Database } from '../client.js';
import { npcPortraitAssignments } from '../schema/index.js';
import { INITIAL_NPC_ROSTER } from '../../../slice/initial-npc-roster.js';

export interface NpcPortraitAssignmentRecord {
  templateId: string;
  portraitId: string;
  updatedByAccountId: string | null;
  updatedAt: Date;
}

export class DrizzleNpcPortraitAssignmentRepository {
  constructor(private readonly db: Database) {}

  async listAll(): Promise<NpcPortraitAssignmentRecord[]> {
    const rows = await this.db.select().from(npcPortraitAssignments);
    return rows.map((row) => ({
      templateId: row.templateId,
      portraitId: row.portraitId,
      updatedByAccountId: row.updatedByAccountId ?? null,
      updatedAt: row.updatedAt,
    }));
  }

  async findByTemplateId(templateId: string): Promise<NpcPortraitAssignmentRecord | null> {
    const rows = await this.db
      .select()
      .from(npcPortraitAssignments)
      .where(eq(npcPortraitAssignments.templateId, templateId))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      templateId: row.templateId,
      portraitId: row.portraitId,
      updatedByAccountId: row.updatedByAccountId ?? null,
      updatedAt: row.updatedAt,
    };
  }

  async upsert(input: {
    templateId: string;
    portraitId: string;
    updatedByAccountId: string;
  }): Promise<NpcPortraitAssignmentRecord> {
    if (!INITIAL_NPC_ROSTER.some((npc) => npc.templateId === input.templateId)) {
      throw new Error(`Unknown NPC template: ${input.templateId}`);
    }

    const rows = await this.db
      .insert(npcPortraitAssignments)
      .values({
        templateId: input.templateId,
        portraitId: input.portraitId,
        updatedByAccountId: input.updatedByAccountId,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: npcPortraitAssignments.templateId,
        set: {
          portraitId: input.portraitId,
          updatedByAccountId: input.updatedByAccountId,
          updatedAt: new Date(),
        },
      })
      .returning();

    const row = rows[0]!;
    return {
      templateId: row.templateId,
      portraitId: row.portraitId,
      updatedByAccountId: row.updatedByAccountId ?? null,
      updatedAt: row.updatedAt,
    };
  }
}
