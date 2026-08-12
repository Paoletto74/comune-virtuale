# Phase 1 Foundation — Implementation Summary

## Scope

Phase 1 runtime foundation only. No gameplay domains.

## Architecture

- **Monorepo:** pnpm workspaces
- **Frontend:** React + TypeScript + Vite + React Router + TanStack Query
- **Backend:** Node.js + TypeScript + Fastify + Drizzle ORM
- **Database:** PostgreSQL (4 Phase 1 tables)
- **Shared:** `@comune-virtuale/shared` contracts/types

## Approved content boundary

Runtime reads 29 APPROVATO packs from `/content` read-only.  
14 PROPOSTA extension packs are NOT loaded.

## Key foundations

| Foundation | Implementation |
|------------|----------------|
| WorldClock | Singleton PG row, server tick |
| Auth | Server-side session + httpOnly cookie |
| Correlation | X-Correlation-Id header |
| Idempotency | idempotency_keys table |
| Audit | audit_log append-only |
| Errors | CommandError structure |
| Content | ApprovedContentLoader allowlist |

## Commands

See root README.md.
