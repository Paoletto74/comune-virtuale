# ID Strategy — Phase 1

Semantic ID types from `contracts_v1/ids.yaml` implemented in `@comune-virtuale/shared`.

## Format (Phase 1)

- **Convention:** UUID v4 strings with branded TypeScript types
- **CorrelationId:** UUID v4, header `X-Correlation-Id`
- **IdempotencyKey:** UUID v4, header `Idempotency-Key`
- **SessionId:** UUID v4, stored in httpOnly cookie `sid`

## Money

- **Storage:** PostgreSQL `BIGINT` (minor units)
- **Application:** JavaScript `bigint` — never `Number` for authoritative amounts
- **API transport:** string representation of minor units (Phase 2+)

## TBD

Definitive prefix conventions (e.g. `cit_`, `txn_`) — deferred to Phase 2.
