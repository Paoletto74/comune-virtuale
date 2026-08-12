# YAML → Runtime Alignment Map (Phase 0 + Phase 1)

This document tracks alignment between the 29 approved YAML packs in `content/` and the runtime in `apps/backend/src/slice/*`. Goal: avoid two divergent versions of the game.

## Used by runtime today

| Area | YAML pack(s) | Runtime source |
|------|----------------|----------------|
| Personal values range | `progression_balance_v1` | `slice/personal-values-constants.ts`, `citizen_personal_values` |
| Task definitions (approved subset) | Various task packs | `slice/task-*`, `application/task/*`, pool registry |
| Economy / transfers | `economy_v1` (partial) | `slice/economy-constants.ts`, `EconomyService` |
| Marketplace catalog | `marketplace_catalog_v1` (partial) | `slice/marketplace-catalog-constants.ts`, game surface DB seed |
| Job offers | `jobs_v1` (partial) | `slice/job-catalog-constants.ts`, game surface |
| NPC templates | NPC-related packs | DB `npcs`, portrait assignments, relationship service |
| World events / flash | Event packs (partial) | `slice/world-*`, `FlashOpportunityService`, `WorldEventService` |
| Referendum templates | `referendum_v1` (partial) | `slice/world-depth-constants.ts`, game surface |
| Gazzetta filler | `gazzetta_v1` (partial) | `slice/gazzetta-constants.ts` |
| **Global progression (Phase 1)** | Not in YAML yet | `slice/citizen-progression-constants.ts`, `citizen_progression` |
| **Careers (Phase 1)** | Described in design YAML, not loaded | `slice/career-constants.ts`, `citizen_career_*`, affinity + switch + grade advancement |
| **Anti-stall fallback tasks** | Design docs in YAML | `slice/anti-stall-tasks-constants.ts`, `POOL_ANTI_STALL` |

## Present in YAML but NOT wired to runtime

| System | YAML representation | Gap |
|--------|---------------------|-----|
| Consumable attributes | Multiple packs | No consumption mechanics — Phase 2+ |
| Career switching rules | Career / progression packs | Active: affinity delta ≥15 + streak ≥5 (`CareerProgressionService`) |
| Career grade advancement | Career packs | Active: global XP + affinity + reputation gates per grade |
| Passivity / inflation per player | Economy / balance packs | Municipality inflation only |
| Advanced chat / social | Chat packs | Not implemented |
| Full 29-pack task corpus | All task YAML | Runtime uses slice + pool registry, not full YAML loader |
| Level labels 1–20 editorial | Progression packs | Partially in slice constants; YAML copy unused |
| Anti-stall full matrix | Design docs in YAML | Repeatable fallback pool when main task pool is exhausted |

## Conflicts / dual sources of truth

1. **Progression thresholds**: YAML packs may still describe old 10-level / old point values. **Runtime wins**: `citizen-progression-constants.ts` (20 levels, configurable thresholds). Migration `0022_*` preserves legacy player levels.
2. **Career names and grades**: YAML may list different grade names. **Runtime wins** for Phase 1: `career-constants.ts` (MEDICINA, MOTORSPORT, CRIMINALITÀ × 20 grades).
3. **Occupation profile codes** vs **career tracks**: `citizen-profile-constants.ts` (impiegato, commerciante…) is identity fluff; **career tracks** are separate (Phase 1 schema only).
4. **Marketplace / jobs**: YAML describes full catalog; runtime uses slice constants + DB with partial seed — items in YAML may not exist in game.

## Master prompt systems in YAML but not in runtime

- Attribute pools with spend/regeneration
- Career trajectory auto-switch (15-point rule + activity threshold)
- Global level names as gameplay gates beyond existing unlock flags
- Player passivity scoring
- Chat channels and reputation decay
- Full referendum consequence engine from YAML templates

## Recommended next alignment steps (Phase 2+)

1. Single loader: map approved YAML progression thresholds → `citizen-progression-constants` at build time (optional codegen).
2. Career definitions: move `career-constants.ts` grades to one YAML pack; load at startup like marketplace catalog.
3. Deprecate duplicate thresholds in unused YAML packs or mark `runtime: false` in pack metadata.
4. Document per-pack `runtimeStatus: active | schema-only | narrative-only` in each pack header.

## Phase 1 migration note

Migration `apps/backend/drizzle/0022_citizen_careers_and_progression_v2.sql`:

- Floors `progression_points` to new threshold for each citizen's stored `main_level` (levels 1–10 legacy preserved).
- Recalculates `main_level` / `main_level_id` from points.
- Seeds `citizen_career_state` and demo affinities for all citizens.

No arbitrary XP wipe. Points are permanent (global XP).
