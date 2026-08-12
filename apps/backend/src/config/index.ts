import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const monorepoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  frontendOrigin: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  sessionSecret: string;
  sessionTtlSeconds: number;
  logLevel: string;
  timeScale: number;
  corsOrigin: string;
  enableDevAuth: boolean;
  enableRealtime: boolean;
  enablePwa: boolean;
  idempotencyTtlSeconds: number;
  contentRoot: string;
  googleOAuth: GoogleOAuthConfig | null;
}

export function loadGoogleOAuthConfig(
  appConfig: Pick<AppConfig, 'corsOrigin' | 'port'>,
): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  return {
    clientId,
    clientSecret,
    redirectUri:
      process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() ??
      `http://localhost:${appConfig.port}/api/v1/auth/google/callback`,
    frontendOrigin: process.env.FRONTEND_ORIGIN?.trim() ?? appConfig.corsOrigin,
  };
}

export function loadConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  return {
    nodeEnv,
    port: Number(process.env.PORT ?? 3000),
    databaseUrl:
      process.env.DATABASE_URL ?? 'postgres://comune:dev_only@localhost:5432/comune_virtuale_dev',
    sessionSecret: process.env.SESSION_SECRET ?? 'dev-only-secret-minimum-32-characters-long',
    sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS ?? 86400),
    logLevel: process.env.LOG_LEVEL ?? 'info',
    timeScale: Number(process.env.TIME_SCALE ?? 1.0),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    enableDevAuth: process.env.ENABLE_DEV_AUTH === 'true',
    enableRealtime: process.env.ENABLE_REALTIME === 'true',
    enablePwa: process.env.ENABLE_PWA === 'true',
    idempotencyTtlSeconds: Number(process.env.IDEMPOTENCY_TTL_SECONDS ?? 86400),
    contentRoot: process.env.CONTENT_ROOT ?? resolve(monorepoRoot, 'content'),
    googleOAuth: loadGoogleOAuthConfig({
      corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
      port: Number(process.env.PORT ?? 3000),
    }),
  };
}
