import type { FastifyInstance } from 'fastify';
import type { AuthService } from '../../application/auth/auth-service.js';
import { SESSION_COOKIE } from '../../application/auth/auth-service.js';
import type { CitizenRepository } from '../../domain/ports/repositories.js';
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  buildGoogleAuthorizationUrl,
  createOAuthState,
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  googleAccountId,
  type GoogleOAuthConfig,
} from '../../application/auth/google-oauth.js';

export interface GoogleAuthRouteDeps {
  authService: AuthService;
  citizens: CitizenRepository;
  googleOAuth: GoogleOAuthConfig | null;
  frontendOrigin: string;
}

function loginRedirect(frontendOrigin: string, error: string): string {
  return `${frontendOrigin}/login?error=${encodeURIComponent(error)}`;
}

export async function registerGoogleAuthRoutes(
  app: FastifyInstance,
  deps: GoogleAuthRouteDeps,
): Promise<void> {
  app.get('/api/v1/auth/google', async (request, reply) => {
    if (!deps.googleOAuth) {
      return reply.redirect(loginRedirect(deps.frontendOrigin, 'google_not_configured'));
    }

    const state = createOAuthState();
    reply.setCookie(GOOGLE_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 600,
      secure: process.env.NODE_ENV === 'production',
    });

    return reply.redirect(buildGoogleAuthorizationUrl(deps.googleOAuth, state));
  });

  app.get('/api/v1/auth/google/callback', async (request, reply) => {
    const frontendOrigin = deps.googleOAuth?.frontendOrigin ?? deps.frontendOrigin;
    const query = request.query as { code?: string; state?: string; error?: string };

    if (query.error || !query.code || !query.state) {
      return reply.redirect(loginRedirect(frontendOrigin, 'google_auth_failed'));
    }

    const savedState = request.cookies[GOOGLE_OAUTH_STATE_COOKIE];
    reply.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, { path: '/' });

    if (!deps.googleOAuth || !savedState || savedState !== query.state) {
      return reply.redirect(loginRedirect(frontendOrigin, 'google_auth_failed'));
    }

    try {
      const tokens = await exchangeGoogleCode(deps.googleOAuth, query.code);
      const userInfo = await fetchGoogleUserInfo(tokens.access_token);
      const accountId = googleAccountId(userInfo.sub);
      const existingCitizen = await deps.citizens.findByAccountId(accountId);
      const { sessionId } = await deps.authService.createDevSession(
        accountId,
        existingCitizen?.citizenId,
      );

      reply.setCookie(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      });

      const destination = existingCitizen ? '/home' : '/create-citizen';
      return reply.redirect(`${frontendOrigin}${destination}`);
    } catch {
      return reply.redirect(loginRedirect(frontendOrigin, 'google_auth_failed'));
    }
  });
}
