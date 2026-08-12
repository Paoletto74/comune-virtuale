# Time Foundation — Phase 1

## Source of truth

`time_main_v1` — single server-authoritative Game Clock.

## Implementation

- Table: `world_clock` (singleton row id=1)
- Service: `WorldClockService` in domain layer
- Tick: server interval 1s real time × `TIME_SCALE` env
- Client: `GET /api/v1/time` read-only

## Rules

- Client cannot set world time
- Real timestamp and world timestamp both tracked
- No per-domain clocks

## Deferred

- Scheduled trigger registry implementation (interface only)
- Catch-up on login (Phase 2)
- Cooldown integration (Phase 2)
