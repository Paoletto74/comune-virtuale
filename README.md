# Comune Virtuale

Architecture-first game project. Phase 1 Foundation.

## Approved content vs runtime code

- `content/` — **APPROVED CONTENT** (read-only baseline, 29 APPROVATO packs). **Do not modify** without explicit approval.
- `apps/`, `packages/`, `tools/` — **RUNTIME CODE** (Phase 1 foundation).

## Prerequisites

- Node.js >= 20
- pnpm 9
- Docker (PostgreSQL)

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:migrate
pnpm validate:content
pnpm dev
```

- Frontend: http://localhost:5173
- Backend health: http://localhost:3000/health

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start frontend + backend |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit/integration |
| `pnpm test:e2e` | Playwright smoke tests |
| `pnpm validate:content` | Validate 29 APPROVATO YAML packs |

## Phase 1 scope

Foundation only — no gameplay domains. See `docs/phase1/`.
