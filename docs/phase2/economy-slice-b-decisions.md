# Phase 2 — Slice B Economy Runtime Decisions

These are **slice-specific runtime decisions**. They do **not** modify the 29 APPROVATO content packs.

## STARTER_CASH

- Amount: **100** minor units
- Currency: `game_currency` (from `economy_main_v1/currency.yaml`)
- Scale: 1 minor unit = 1 display unit (pack `decimalPlaces` remains TBD)
- Transaction type: `systemGrant` / class `money_creation`
- Granted atomically on citizen creation

## Cash axis independence

- `citizen_economic_accounts` is separate from `citizen_personal_values`
- help/ignore on `DEMO_ELDERLY_CROSSING` do **not** modify cash in Slice B

## Deferred

- steal_wallet, task costs/rewards, stress, chronicle
- net worth, debt, taxes, marketplace
