import { and, eq } from 'drizzle-orm';
import type { DayNightPhase } from '@comune-virtuale/shared';
import type { Database } from '../client.js';
import {
  citizenPersonalValues,
  citizenProgression,
  citizenProgressionGrants,
  citizens,
} from '../schema/index.js';
import type {
  CitizenRecord,
  CitizenRepository,
  CitizenProgressionGrantRecord,
} from '../../../domain/ports/repositories.js';
import {
  resolveLevelFromPoints,
  resolveMainLevelId,
} from '../../../slice/citizen-progression-constants.js';
import {
  PERSONAL_VALUE_CLAMP_MAX,
  PERSONAL_VALUE_CLAMP_MIN,
  CLAMPED_PERSONAL_VALUE_KEYS,
} from '../../../slice/constants.js';
import type { DrizzleEconomyRepository } from './economy-repository.js';

function clampPersonalValue(key: string, value: number): number {
  if (!(CLAMPED_PERSONAL_VALUE_KEYS as readonly string[]).includes(key)) return value;
  return Math.max(PERSONAL_VALUE_CLAMP_MIN, Math.min(PERSONAL_VALUE_CLAMP_MAX, value));
}

function mapCitizen(row: typeof citizens.$inferSelect): CitizenRecord {
  return {
    citizenId: row.citizenId,
    accountId: row.accountId,
    displayName: row.displayName,
    gender: row.gender,
    age: row.age,
    portraitId: row.portraitId ?? null,
    onboardingCompletedAt: row.onboardingCompletedAt,
    createdAt: row.createdAt,
  };
}

export class DrizzleCitizenRepository implements CitizenRepository {
  constructor(
    private readonly db: Database,
    private readonly economy?: DrizzleEconomyRepository,
  ) {}

  async findByAccountId(accountId: string): Promise<CitizenRecord | null> {
    const rows = await this.db
      .select()
      .from(citizens)
      .where(eq(citizens.accountId, accountId))
      .limit(1);
    const row = rows[0];
    return row ? mapCitizen(row) : null;
  }

  async findById(citizenId: string): Promise<CitizenRecord | null> {
    const rows = await this.db
      .select()
      .from(citizens)
      .where(eq(citizens.citizenId, citizenId))
      .limit(1);
    const row = rows[0];
    return row ? mapCitizen(row) : null;
  }

  async createWithOnboarding(input: {
    citizenId: string;
    accountId: string;
    displayName: string;
    gender: string;
    age: number;
    portraitId?: string | null;
    mainLevelId: string;
    mainLevel: number;
    personalValues: Record<string, number>;
  }): Promise<CitizenRecord> {
    return this.db.transaction(async (tx) => {
      const citizenRows = await tx
        .insert(citizens)
        .values({
          citizenId: input.citizenId,
          accountId: input.accountId,
          displayName: input.displayName,
          gender: input.gender,
          age: input.age,
          portraitId: input.portraitId ?? null,
        })
        .returning();

      await tx.insert(citizenProgression).values({
        citizenId: input.citizenId,
        mainLevelId: input.mainLevelId,
        mainLevel: input.mainLevel,
        progressionPoints: 0,
      });

      const valueEntries = Object.entries(input.personalValues);
      if (valueEntries.length > 0) {
        await tx.insert(citizenPersonalValues).values(
          valueEntries.map(([valueKey, value]) => ({
            citizenId: input.citizenId,
            valueKey,
            value,
          })),
        );
      }

      if (this.economy) {
        await this.economy.grantStarterCashInTransaction(tx, input.citizenId);
      }

      return mapCitizen(citizenRows[0]!);
    });
  }

  async getProgression(citizenId: string) {
    const rows = await this.db
      .select()
      .from(citizenProgression)
      .where(eq(citizenProgression.citizenId, citizenId))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      citizenId: row.citizenId,
      mainLevelId: row.mainLevelId,
      mainLevel: row.mainLevel,
      progressionPoints: row.progressionPoints ?? 0,
    };
  }

  async applyProgressionGrant(input: {
    grantId: string;
    citizenId: string;
    idempotencyKey: string;
    pointsGranted: number;
    sourceType: string;
    sourceRef?: string;
  }): Promise<{
    created: boolean;
    grant: CitizenProgressionGrantRecord;
    progression: {
      citizenId: string;
      mainLevelId: string;
      mainLevel: number;
      progressionPoints: number;
    };
  }> {
    return this.db.transaction(async (tx) => {
      const existingGrantRows = await tx
        .select()
        .from(citizenProgressionGrants)
        .where(
          and(
            eq(citizenProgressionGrants.citizenId, input.citizenId),
            eq(citizenProgressionGrants.idempotencyKey, input.idempotencyKey),
          ),
        )
        .limit(1);

      const progressionRows = await tx
        .select()
        .from(citizenProgression)
        .where(eq(citizenProgression.citizenId, input.citizenId))
        .limit(1);
      const progressionRow = progressionRows[0];
      if (!progressionRow) {
        throw new Error(`Missing progression row for citizen ${input.citizenId}`);
      }

      const mapGrant = (row: typeof citizenProgressionGrants.$inferSelect): CitizenProgressionGrantRecord => ({
        grantId: row.grantId,
        citizenId: row.citizenId,
        idempotencyKey: row.idempotencyKey,
        pointsGranted: row.pointsGranted,
        sourceType: row.sourceType,
        sourceRef: row.sourceRef,
        createdAt: row.createdAt,
      });

      const mapProgression = (row: typeof citizenProgression.$inferSelect) => ({
        citizenId: row.citizenId,
        mainLevelId: row.mainLevelId,
        mainLevel: row.mainLevel,
        progressionPoints: row.progressionPoints ?? 0,
      });

      if (existingGrantRows[0]) {
        return {
          created: false,
          grant: mapGrant(existingGrantRows[0]),
          progression: mapProgression(progressionRow),
        };
      }

      const newPoints = progressionRow.progressionPoints + input.pointsGranted;
      const newLevel = resolveLevelFromPoints(newPoints);
      const newLevelId = resolveMainLevelId(newLevel);

      await tx.insert(citizenProgressionGrants).values({
        grantId: input.grantId,
        citizenId: input.citizenId,
        idempotencyKey: input.idempotencyKey,
        pointsGranted: input.pointsGranted,
        sourceType: input.sourceType,
        sourceRef: input.sourceRef ?? null,
      });

      const updatedRows = await tx
        .update(citizenProgression)
        .set({
          progressionPoints: newPoints,
          mainLevel: newLevel,
          mainLevelId: newLevelId,
        })
        .where(eq(citizenProgression.citizenId, input.citizenId))
        .returning();

      return {
        created: true,
        grant: {
          grantId: input.grantId,
          citizenId: input.citizenId,
          idempotencyKey: input.idempotencyKey,
          pointsGranted: input.pointsGranted,
          sourceType: input.sourceType,
          sourceRef: input.sourceRef ?? null,
          createdAt: new Date(),
        },
        progression: mapProgression(updatedRows[0]!),
      };
    });
  }

  async getPersonalValues(citizenId: string): Promise<Record<string, number>> {
    const rows = await this.db
      .select()
      .from(citizenPersonalValues)
      .where(eq(citizenPersonalValues.citizenId, citizenId));
    return Object.fromEntries(rows.map((r) => [r.valueKey, r.value]));
  }

  async incrementPersonalValues(
    citizenId: string,
    deltas: Record<string, number>,
  ): Promise<Record<string, number>> {
    const result = await this.applyPersonalValueEffects(citizenId, { deltas });
    return result.values;
  }

  async applyPersonalValueEffects(
    citizenId: string,
    input: {
      requires?: Record<string, number>;
      costs?: Record<string, number>;
      deltas?: Record<string, number>;
    },
  ): Promise<{ values: Record<string, number>; applied: Record<string, number> }> {
    return this.db.transaction(async (tx) => {
      const allRows = await tx
        .select()
        .from(citizenPersonalValues)
        .where(eq(citizenPersonalValues.citizenId, citizenId));
      const current = Object.fromEntries(allRows.map((r) => [r.valueKey, r.value]));

      const requires = input.requires ?? {};
      const costs = input.costs ?? {};
      const deltas = input.deltas ?? {};

      for (const [valueKey, required] of Object.entries(requires)) {
        if (!required || required <= 0) continue;
        const available = current[valueKey] ?? 0;
        if (available < required) {
          throw new Error(`INSUFFICIENT_PERSONAL_VALUE:${valueKey}`);
        }
      }

      for (const [valueKey, cost] of Object.entries(costs)) {
        if (!cost || cost <= 0) continue;
        const available = current[valueKey] ?? 0;
        if (available < cost) {
          throw new Error(`INSUFFICIENT_PERSONAL_VALUE:${valueKey}`);
        }
      }

      const netByKey: Record<string, number> = {};
      const applied: Record<string, number> = {};

      for (const [valueKey, cost] of Object.entries(costs)) {
        if (!cost || cost <= 0) continue;
        netByKey[valueKey] = (netByKey[valueKey] ?? 0) - cost;
        applied[valueKey] = (applied[valueKey] ?? 0) - cost;
      }

      for (const [valueKey, delta] of Object.entries(deltas)) {
        if (!delta || delta === 0) continue;
        netByKey[valueKey] = (netByKey[valueKey] ?? 0) + delta;
        applied[valueKey] = (applied[valueKey] ?? 0) + delta;
      }

      for (const [valueKey, netDelta] of Object.entries(netByKey)) {
        if (netDelta === 0) continue;
        const rows = await tx
          .select()
          .from(citizenPersonalValues)
          .where(
            and(
              eq(citizenPersonalValues.citizenId, citizenId),
              eq(citizenPersonalValues.valueKey, valueKey),
            ),
          )
          .limit(1);

        const currentRow = rows[0];
        const nextValue = clampPersonalValue(valueKey, (currentRow?.value ?? 0) + netDelta);

        if (currentRow) {
          await tx
            .update(citizenPersonalValues)
            .set({ value: nextValue })
            .where(
              and(
                eq(citizenPersonalValues.citizenId, citizenId),
                eq(citizenPersonalValues.valueKey, valueKey),
              ),
            );
        } else {
          await tx.insert(citizenPersonalValues).values({
            citizenId,
            valueKey,
            value: nextValue,
          });
        }
      }

      const updatedRows = await tx
        .select()
        .from(citizenPersonalValues)
        .where(eq(citizenPersonalValues.citizenId, citizenId));

      return {
        values: Object.fromEntries(updatedRows.map((r) => [r.valueKey, r.value])),
        applied,
      };
    });
  }

  async setPersonalValues(
    citizenId: string,
    values: Record<string, number>,
  ): Promise<Record<string, number>> {
    return this.db.transaction(async (tx) => {
      for (const [valueKey, value] of Object.entries(values)) {
        const rows = await tx
          .select()
          .from(citizenPersonalValues)
          .where(
            and(
              eq(citizenPersonalValues.citizenId, citizenId),
              eq(citizenPersonalValues.valueKey, valueKey),
            ),
          )
          .limit(1);

        const currentRow = rows[0];
        if (currentRow) {
          await tx
            .update(citizenPersonalValues)
            .set({ value: clampPersonalValue(valueKey, value) })
            .where(
              and(
                eq(citizenPersonalValues.citizenId, citizenId),
                eq(citizenPersonalValues.valueKey, valueKey),
              ),
            );
        } else {
          await tx.insert(citizenPersonalValues).values({
            citizenId,
            valueKey,
            value: clampPersonalValue(valueKey, value),
          });
        }
      }

      const allRows = await tx
        .select()
        .from(citizenPersonalValues)
        .where(eq(citizenPersonalValues.citizenId, citizenId));
      return Object.fromEntries(allRows.map((r) => [r.valueKey, r.value]));
    });
  }

  async getLastTaskDayPhase(citizenId: string): Promise<DayNightPhase | null> {
    const rows = await this.db
      .select({ lastTaskDayPhase: citizens.lastTaskDayPhase })
      .from(citizens)
      .where(eq(citizens.citizenId, citizenId))
      .limit(1);
    const phase = rows[0]?.lastTaskDayPhase;
    if (
      phase === 'dawn' ||
      phase === 'day' ||
      phase === 'afternoon' ||
      phase === 'sunset' ||
      phase === 'night'
    ) {
      return phase;
    }
    return null;
  }

  async setLastTaskDayPhase(citizenId: string, phase: DayNightPhase): Promise<void> {
    await this.db
      .update(citizens)
      .set({ lastTaskDayPhase: phase })
      .where(eq(citizens.citizenId, citizenId));
  }

  async updatePortraitId(citizenId: string, portraitId: string): Promise<CitizenRecord> {
    const rows = await this.db
      .update(citizens)
      .set({ portraitId })
      .where(eq(citizens.citizenId, citizenId))
      .returning();
    const row = rows[0];
    if (!row) {
      throw new Error(`Citizen not found: ${citizenId}`);
    }
    return mapCitizen(row);
  }

  async updateDisplayName(citizenId: string, displayName: string): Promise<CitizenRecord> {
    const rows = await this.db
      .update(citizens)
      .set({ displayName: displayName.trim() })
      .where(eq(citizens.citizenId, citizenId))
      .returning();
    const row = rows[0];
    if (!row) {
      throw new Error(`Citizen not found: ${citizenId}`);
    }
    return mapCitizen(row);
  }

  async updateMainLevel(citizenId: string, mainLevel: number, mainLevelId: string): Promise<void> {
    await this.db
      .update(citizenProgression)
      .set({ mainLevel, mainLevelId })
      .where(eq(citizenProgression.citizenId, citizenId));
  }

  async listAll(): Promise<CitizenRecord[]> {
    const rows = await this.db.select().from(citizens).orderBy(citizens.displayName);
    return rows.map(mapCitizen);
  }

  async deleteByCitizenId(citizenId: string): Promise<void> {
    await this.db.delete(citizens).where(eq(citizens.citizenId, citizenId));
  }
}
