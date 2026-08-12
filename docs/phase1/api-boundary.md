# API Boundary — Phase 1

## Flow

```
Frontend (UNTRUSTED)
  → REST /api/v1/*
    → Fastify plugins (correlation, auth, idempotency, audit)
      → Application services
        → Domain ports
          → Drizzle repositories
```

## Phase 1 endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Liveness |
| GET | /api/v1/time | No | WorldTimeSnapshot (read-only) |
| GET | /api/v1/content/summary | No | 29 APPROVATO pack summary |
| GET | /api/v1/me | Yes | Session actor |
| POST | /api/v1/auth/login | No* | Dev login (*ENABLE_DEV_AUTH) |
| POST | /api/v1/auth/logout | Yes | Session invalidate |
| POST | /api/v1/_dev/idempotency-test | Yes | Idempotency smoke (dev) |

## Headers

- `X-Correlation-Id` — propagated on all requests/responses
- `Idempotency-Key` — required on POST mutations (except /auth/*)

## Errors

All errors return `CommandError` JSON structure per contracts_v1.
