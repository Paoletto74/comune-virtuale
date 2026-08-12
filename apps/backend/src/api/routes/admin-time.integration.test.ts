import { describe, expect, it } from 'vitest';
import { buildTestApp, loginAsAdmin, withAdminSession } from '../../test/test-app.js';

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('admin time scale validation', () => {
  it('accepts timeScale 0, 5, and 10', async () => {
    const { app, close } = await buildTestApp();

    try {
      const admin = await loginAsAdmin(app);
      await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: withAdminSession(admin),
        payload: {
          displayName: 'Admin Clock',
          gender: 'male',
          age: 30,
        },
      });

      for (const timeScale of [0, 5, 10]) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/admin/time/scale',
          headers: withAdminSession(admin),
          payload: { timeScale },
        });
        expect(response.statusCode).toBe(200);
        expect((response.json() as { timeScale: number }).timeScale).toBe(timeScale);
      }
    } finally {
      const admin = await loginAsAdmin(app);
      await app.inject({
        method: 'POST',
        url: '/api/v1/admin/time/scale',
        headers: withAdminSession(admin),
        payload: { timeScale: 1 },
      });
      await close();
    }
  });

  it('rejects timeScale values outside 0–10', async () => {
    const { app, close } = await buildTestApp();

    try {
      const admin = await loginAsAdmin(app);
      await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: withAdminSession(admin),
        payload: {
          displayName: 'Admin Clock',
          gender: 'male',
          age: 30,
        },
      });

      for (const timeScale of [-1, 10.5, 11, 100]) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/admin/time/scale',
          headers: withAdminSession(admin),
          payload: { timeScale },
        });
        expect(response.statusCode).toBe(400);
      }
    } finally {
      await close();
    }
  });
});
