/** Real-world visual time phases for ambient assets (MEGA 4/4). Separate from game clock. */

export type VisualTimePhase = 'morning' | 'day' | 'sunset' | 'night';

export const VISUAL_TIME_PHASES: readonly VisualTimePhase[] = [
  'morning',
  'day',
  'sunset',
  'night',
] as const;

const PHASE_LABELS: Record<VisualTimePhase, string> = {
  morning: 'Mattino',
  day: 'Giorno',
  sunset: 'Tramonto',
  night: 'Notte',
};

/**
 * Resolve visual phase from real local clock hour (0–23).
 *
 * 06:00–11:59 → morning
 * 12:00–16:59 → day
 * 17:00–20:59 → sunset
 * 21:00–05:59 → night
 */
export function resolveVisualTimePhase(date: Date = new Date()): VisualTimePhase {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const totalMinutes = hour * 60 + minute;

  if (totalMinutes >= 6 * 60 && totalMinutes < 12 * 60) return 'morning';
  if (totalMinutes >= 12 * 60 && totalMinutes < 17 * 60) return 'day';
  if (totalMinutes >= 17 * 60 && totalMinutes < 21 * 60) return 'sunset';
  return 'night';
}

export function visualTimePhaseLabel(phase: VisualTimePhase): string {
  return PHASE_LABELS[phase];
}

/** Header icon: moon only during night; sun for morning, day and sunset. */
export function isVisualNightHeader(phase: VisualTimePhase): boolean {
  return phase === 'night';
}
