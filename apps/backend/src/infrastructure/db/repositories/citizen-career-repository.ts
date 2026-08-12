import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import type { Database } from '../client.js';
import {
  citizenCareerAffinities,
  citizenCareerHistory,
  citizenCareerState,
} from '../schema/index.js';
import {
  DEMO_CAREER_IDS,
  type EmergingTrajectory,
  resolveCareerDefinition,
  resolveCareerGradeIndex,
} from '../../../slice/career-constants.js';

export interface CitizenCareerStateRecord {
  citizenId: string;
  currentCareerId: string | null;
  currentGradeIndex: number;
  emergingTrajectories: EmergingTrajectory[];
  pendingSwitchCareerId: string | null;
  pendingSwitchStreak: number;
  updatedAt: Date;
}

export interface CitizenCareerAffinityRecord {
  citizenId: string;
  careerId: string;
  affinity: number;
}

export interface CitizenCareerHistoryRecord {
  historyId: string;
  citizenId: string;
  careerId: string;
  gradeIndex: number;
  changeType: string;
  reason: string | null;
  recordedAt: Date;
}

export class DrizzleCitizenCareerRepository {
  constructor(private readonly db: Database) {}

  async ensureSeeded(citizenId: string): Promise<void> {
    const existing = await this.db
      .select()
      .from(citizenCareerState)
      .where(eq(citizenCareerState.citizenId, citizenId))
      .limit(1);

    if (!existing[0]) {
      await this.db.insert(citizenCareerState).values({
        citizenId,
        currentCareerId: null,
        currentGradeIndex: 1,
        emergingTrajectories: [],
      });
    }

    for (const careerId of DEMO_CAREER_IDS) {
      const affinityRows = await this.db
        .select()
        .from(citizenCareerAffinities)
        .where(
          and(
            eq(citizenCareerAffinities.citizenId, citizenId),
            eq(citizenCareerAffinities.careerId, careerId),
          ),
        )
        .limit(1);

      if (!affinityRows[0]) {
        await this.db.insert(citizenCareerAffinities).values({
          citizenId,
          careerId,
          affinity: 0,
        });
      }
    }
  }

  async getState(citizenId: string): Promise<CitizenCareerStateRecord | null> {
    const rows = await this.db
      .select()
      .from(citizenCareerState)
      .where(eq(citizenCareerState.citizenId, citizenId))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      citizenId: row.citizenId,
      currentCareerId: row.currentCareerId,
      currentGradeIndex: row.currentGradeIndex,
      emergingTrajectories: (row.emergingTrajectories ?? []) as EmergingTrajectory[],
      pendingSwitchCareerId: row.pendingSwitchCareerId ?? null,
      pendingSwitchStreak: row.pendingSwitchStreak ?? 0,
      updatedAt: row.updatedAt,
    };
  }

  async listAffinities(citizenId: string): Promise<CitizenCareerAffinityRecord[]> {
    const rows = await this.db
      .select()
      .from(citizenCareerAffinities)
      .where(eq(citizenCareerAffinities.citizenId, citizenId));
    return rows.map((row) => ({
      citizenId: row.citizenId,
      careerId: row.careerId,
      affinity: row.affinity,
    }));
  }

  async listHistory(citizenId: string, limit = 20): Promise<CitizenCareerHistoryRecord[]> {
    const rows = await this.db
      .select()
      .from(citizenCareerHistory)
      .where(eq(citizenCareerHistory.citizenId, citizenId))
      .orderBy(desc(citizenCareerHistory.recordedAt))
      .limit(limit);
    return rows.map((row) => ({
      historyId: row.historyId,
      citizenId: row.citizenId,
      careerId: row.careerId,
      gradeIndex: row.gradeIndex,
      changeType: row.changeType,
      reason: row.reason,
      recordedAt: row.recordedAt,
    }));
  }

  async setAffinity(citizenId: string, careerId: string, affinity: number): Promise<void> {
    if (!resolveCareerDefinition(careerId)) return;
    await this.db
      .insert(citizenCareerAffinities)
      .values({ citizenId, careerId, affinity })
      .onConflictDoUpdate({
        target: [citizenCareerAffinities.citizenId, citizenCareerAffinities.careerId],
        set: { affinity },
      });
  }

  async updateState(input: {
    citizenId: string;
    currentCareerId?: string | null;
    currentGradeIndex?: number;
    emergingTrajectories?: EmergingTrajectory[];
    pendingSwitchCareerId?: string | null;
    pendingSwitchStreak?: number;
  }): Promise<void> {
    const gradeIndex =
      input.currentGradeIndex != null
        ? resolveCareerGradeIndex(input.currentCareerId ?? '', input.currentGradeIndex)
        : undefined;

    await this.db
      .update(citizenCareerState)
      .set({
        ...(input.currentCareerId !== undefined ? { currentCareerId: input.currentCareerId } : {}),
        ...(gradeIndex !== undefined ? { currentGradeIndex: gradeIndex } : {}),
        ...(input.emergingTrajectories !== undefined
          ? { emergingTrajectories: input.emergingTrajectories }
          : {}),
        ...(input.pendingSwitchCareerId !== undefined
          ? { pendingSwitchCareerId: input.pendingSwitchCareerId }
          : {}),
        ...(input.pendingSwitchStreak !== undefined
          ? { pendingSwitchStreak: input.pendingSwitchStreak }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(citizenCareerState.citizenId, input.citizenId));
  }

  async appendHistory(input: {
    citizenId: string;
    careerId: string;
    gradeIndex: number;
    changeType: string;
    reason?: string;
  }): Promise<CitizenCareerHistoryRecord> {
    const historyId = randomUUID();
    await this.db.insert(citizenCareerHistory).values({
      historyId,
      citizenId: input.citizenId,
      careerId: input.careerId,
      gradeIndex: resolveCareerGradeIndex(input.careerId, input.gradeIndex),
      changeType: input.changeType,
      reason: input.reason ?? null,
    });
    return {
      historyId,
      citizenId: input.citizenId,
      careerId: input.careerId,
      gradeIndex: resolveCareerGradeIndex(input.careerId, input.gradeIndex),
      changeType: input.changeType,
      reason: input.reason ?? null,
      recordedAt: new Date(),
    };
  }
}
