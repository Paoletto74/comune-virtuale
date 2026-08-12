/** World time types — time_main_v1, contracts_v1/time_types.yaml */

export interface WorldTimeSnapshot {
  worldTimeMs: number;
  timeScale: number;
  realTimestampMs: number;
  isPaused: boolean;
  schemaVersion: number;
}

export interface GameDateSnapshot {
  day: number;
  hour: number;
  minute: number;
  second: number;
  label: string;
}

export interface RealTimestamp {
  iso: string;
  epochMs: number;
}

export function createWorldTimeSnapshot(
  worldTimeMs: number,
  timeScale: number,
  realTimestampMs: number = Date.now(),
  isPaused: boolean = false,
  schemaVersion: number = 1,
): WorldTimeSnapshot {
  return { worldTimeMs, timeScale, realTimestampMs, isPaused, schemaVersion };
}

/** Derives a simple game calendar from monotonic world time (no month/year yet). */
export function deriveGameDate(worldTimeMs: number): GameDateSnapshot {
  const totalSeconds = Math.floor(Math.max(0, worldTimeMs) / 1000);
  const day = Math.floor(totalSeconds / 86400) + 1;
  const hour = Math.floor((totalSeconds % 86400) / 3600);
  const minute = Math.floor((totalSeconds % 3600) / 60);
  const second = totalSeconds % 60;
  const label = `Giorno ${day}, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
  return { day, hour, minute, second, label };
}
