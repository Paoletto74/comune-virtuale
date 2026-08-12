/** Visual day/night phases derived from in-game clock hour (0–23). */

export type DayNightPhase = 'dawn' | 'day' | 'afternoon' | 'sunset' | 'night';

export interface GameTimeInput {
  hour: number;
  minute?: number;
}

const PHASE_LABELS: Record<DayNightPhase, string> = {
  dawn: 'Alba',
  day: 'Giorno',
  afternoon: 'Pomeriggio',
  sunset: 'Tramonto',
  night: 'Notte',
};

/** Resolve visual day/night phase from game clock hour (0–23). */
export function resolveDayNightPhase({ hour }: GameTimeInput): DayNightPhase {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 13) return 'day';
  if (h >= 13 && h < 18) return 'afternoon';
  if (h >= 18 && h < 21) return 'sunset';
  return 'night';
}

export function dayNightPhaseLabel(phase: DayNightPhase): string {
  return PHASE_LABELS[phase];
}

export function formatGameTimeAccessibilityLabel(gameDate: {
  day: number;
  hour: number;
  minute: number;
  second?: number;
  label?: string;
}): string {
  const phase = resolveDayNightPhase(gameDate);
  const phaseLabel = dayNightPhaseLabel(phase);
  if (gameDate.label) {
    return `${phaseLabel}. ${gameDate.label}`;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${phaseLabel}. Giorno ${gameDate.day}, ${pad(gameDate.hour)}:${pad(gameDate.minute)}`;
}
