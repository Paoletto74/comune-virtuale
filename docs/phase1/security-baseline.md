# Security Baseline — Phase 1

| Control | Status |
|---------|--------|
| Frontend UNTRUSTED | Enforced — no authoritative fields in client |
| Default DENY auth | `requireAuth` on protected routes |
| httpOnly session cookie | `sid` cookie |
| Input validation | Fastify JSON Schema on POST bodies |
| Rate limiting | @fastify/rate-limit 100/min |
| Helmet headers | @fastify/helmet |
| CORS | Restricted to CORS_ORIGIN |
| Idempotency | Mutation replay protection |
| Audit log | Append-only audit_log table |
| Dev auth gated | ENABLE_DEV_AUTH env |
| Secrets | SESSION_SECRET via env, not in repo |

## Not in Phase 1

- OAuth/OIDC provider
- CSRF token (sameSite=strict partial mitigation)
- Production rate limit tuning (TBD)
