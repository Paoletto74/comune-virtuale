# Phase 2 — Vertical Slice V1 Runtime Decisions

These are **slice-specific runtime decisions**. They do **not** modify the 29 APPROVATO content packs.

## Personal values baseline

- `sympathy` and `reputation` start at **0** when a citizen is created.
- Packs do not define starting values; DB columns are NOT NULL integers.

## DEMO_HELP_ELDERLY_IMMEDIATE effects

When completing `DEMO_ELDERLY_CROSSING` with option `help`:

- `sympathy`: +1
- `reputation`: +1

Magnitudes in `task_main_v1/effects.yaml` remain `TBD` in content; runtime applies the values above.

## DEMO_IGNORE_ELDERLY effects (Slice V1.1)

When completing `DEMO_ELDERLY_CROSSING` with option `ignore`:

- `sympathy`: no change (0 delta)
- `reputation`: no change (0 delta)

Pack lists `DEMO_IGNORE_ELDERLY` with empty `items`; runtime applies no personal value updates.

## Allowed demo task options (Slice V1.1)

- `help`
- `ignore`

Not implemented: `steal_wallet`, `DEMO_HELP_ELDERLY_DELAYED`.

## Task spawn

After `POST /api/v1/citizens` succeeds, one `TaskInstance` for `DEMO_ELDERLY_CROSSING` is created with status `active`.

## Deferred (not in slice)

- Character trade-off setup (B1)
- Economy display (B5)
- Municipality stats (B6)
- Notification delivery (B7)
- Options `ignore`, `steal_wallet`
