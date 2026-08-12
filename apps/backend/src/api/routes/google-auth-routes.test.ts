import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import { registerGoogleAuthRoutes } from './google-auth-routes.js';
import { AuthService } from '../../application/auth/auth-service.js';
import type { CitizenRepository, SessionRepository } from '../../domain/ports/repositories.js';

describe('registerGoogleAuthRoutes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const sessions = {
      create: async () => {},
      findById: async () => null,
      updateCitizenId: async () => {},
      revoke: async () => {},
    } as unknown as SessionRepository;

    const authService = new AuthService(sessions, 86400, new Set());
    const citizens = {
      findByAccountId: async () => null,
    } as unknown as CitizenRepository;

    app = Fastify();
    await app.register(cookie, { secret: 'test-secret-minimum-32-characters-long' });
    await registerGoogleAuthRoutes(app, {
      authService,
      citizens,
      googleOAuth: null,
      frontendOrigin: 'http://localhost:5173',
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('redirects to login when Google OAuth is not configured', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/google',
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(
      'http://localhost:5173/login?error=google_not_configured',
    );
  });
});
