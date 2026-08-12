import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { buildTestApp, createCitizenViaApi, ensureAdminWithCitizen, loginAs, withSession } from '../../test/test-app.js';
import { INITIAL_NPC_ROSTER } from '../../slice/initial-npc-roster.js';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('admin context integration', () => {
  it('denies non-admin access to admin endpoints', async () => {
    const ctx = await buildTestApp();
    try {
      const player = await loginAs(ctx.app, 'player-no-admin');
      await createCitizenViaApi(ctx.app, player.sessionCookie, {
        displayName: 'Player',
        gender: 'male',
        age: 30,
      });

      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/v1/admin/npcs',
        headers: withSession(player.sessionCookie),
      });

      expect(response.statusCode).toBe(403);
    } finally {
      await ctx.close();
    }
  });

  it('allows admin to assign and persist NPC portrait', async () => {
    const ctx = await buildTestApp();
    try {
      const admin = await ensureAdminWithCitizen(ctx.app);

      const templateId = INITIAL_NPC_ROSTER[0]!.templateId;

      const blockedPlayer = await loginAs(ctx.app, 'player-blocked');
      await createCitizenViaApi(ctx.app, blockedPlayer.sessionCookie, {
        displayName: 'Blocked Player',
        gender: 'male',
        age: 30,
      });

      const denied = await ctx.app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/npcs/${templateId}/portrait`,
        headers: withSession(blockedPlayer.sessionCookie),
        payload: { portraitId: 'npc_001' },
      });
      expect(denied.statusCode).toBe(403);

      const unauthenticated = await ctx.app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/npcs/${templateId}/portrait`,
        payload: { portraitId: 'npc_001' },
      });
      expect(unauthenticated.statusCode).toBe(401);

      const patch = await ctx.app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/npcs/${templateId}/portrait`,
        headers: withSession(admin.sessionCookie),
        payload: { portraitId: 'npc_007' },
      });
      expect(patch.statusCode).toBe(200);
      expect(patch.json().npc.portraitId).toBe('npc_007');

      const directory = await ctx.app.inject({
        method: 'GET',
        url: '/api/v1/citizens',
        headers: withSession(admin.sessionCookie),
      });
      const entry = directory.json().citizens.find(
        (citizen: { citizenId: string }) => citizen.citizenId === templateId,
      );
      expect(entry?.portraitId).toBe('npc_007');

      const relogin = await loginAs(ctx.app, 'dev-admin-test');
      const listed = await ctx.app.inject({
        method: 'GET',
        url: '/api/v1/admin/npcs',
        headers: withSession(relogin.sessionCookie),
      });
      const npc = listed.json().npcs.find(
        (row: { templateId: string }) => row.templateId === templateId,
      );
      expect(npc?.portraitId).toBe('npc_007');
    } finally {
      await ctx.close();
    }
  });

  it('allows admin to patch player citizen fields but not roles', async () => {
    const ctx = await buildTestApp();
    try {
      const admin = await ensureAdminWithCitizen(ctx.app);

      const target = await loginAs(ctx.app, `target-player-${randomUUID()}`);
      const created = await createCitizenViaApi(ctx.app, target.sessionCookie, {
        displayName: 'Target Player',
        gender: 'female',
        age: 28,
        personality: { sympathy: 30, reputation: 30, happiness: 30 },
      });
      expect(created.statusCode).toBe(200);
      expect(created.citizenId).toBeTruthy();

      const patch = await ctx.app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/citizens/${created.citizenId}`,
        headers: withSession(admin.sessionCookie),
        payload: {
          displayName: 'Target Modificato',
          mainLevel: 4,
          sympathy: 42,
        },
      });
      expect(patch.statusCode).toBe(200);
      expect(patch.json().citizen.displayName).toBe('Target Modificato');
      expect(patch.json().citizen.mainLevel).toBe(4);
      expect(patch.json().citizen.sympathy).toBe(42);

      const me = await ctx.app.inject({
        method: 'GET',
        url: '/api/v1/me',
        headers: withSession(target.sessionCookie),
      });
      expect(me.json().roles).toEqual(['PLAYER']);
    } finally {
      await ctx.close();
    }
  });
});
