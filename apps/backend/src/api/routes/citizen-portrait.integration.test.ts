import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildTestApp, loginAs, withIdempotency, withSession } from '../../test/test-app.js';

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('citizen portrait and account deletion', () => {
  it('persists portraitId on creation and allows updating it', async () => {
    const accountId = `test-portrait-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: {
          displayName: 'Portrait Citizen',
          gender: 'female',
          age: 29,
          portraitId: 'profile_012',
        },
      });
      expect(createResponse.statusCode).toBe(200);

      const homeResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/home',
        headers: withSession(login.sessionCookie),
      });
      const home = homeResponse.json() as { portraitId: string | null };
      expect(home.portraitId).toBe('profile_012');

      const patchResponse = await app.inject({
        method: 'PATCH',
        url: '/api/v1/profile/portrait',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
          'content-type': 'application/json',
        },
        payload: { portraitId: 'profile_037' },
      });
      expect(patchResponse.statusCode).toBe(200);

      const profileResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/profile/detail',
        headers: withSession(login.sessionCookie),
      });
      const profile = profileResponse.json() as { portraitId: string | null };
      expect(profile.portraitId).toBe('profile_037');
    } finally {
      await close();
    }
  });

  it('deletes the authenticated account citizen and returns to pending creation', async () => {
    const accountId = `test-delete-${randomUUID()}`;
    const { app, close } = await buildTestApp();

    try {
      const login = await loginAs(app, accountId);
      await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: {
          displayName: 'Delete Me',
          gender: 'male',
          age: 40,
          portraitId: 'profile_005',
        },
      });

      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: '/api/v1/account',
        headers: withSession(login.sessionCookie),
      });
      expect(deleteResponse.statusCode).toBe(200);

      const meResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/me',
        headers: withSession(login.sessionCookie),
      });
      const me = meResponse.json() as { needsCitizenCreation: boolean; citizenId: string | null };
      expect(me.needsCitizenCreation).toBe(true);
      expect(me.citizenId).toBeNull();

      const recreateResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: {
          displayName: 'Fresh Citizen',
          gender: 'other',
          age: 22,
          portraitId: 'profile_021',
        },
      });
      expect(recreateResponse.statusCode).toBe(200);
    } finally {
      await close();
    }
  });
});
