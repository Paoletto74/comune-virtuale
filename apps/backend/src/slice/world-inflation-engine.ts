import { createHash } from 'node:crypto';
import { GAME_MS_PER_DAY } from './game-surface-constants.js';

/** 100.00% baseline catalog prices. */
export const BASE_PRICE_INDEX_BPS = 10_000;

export const INFLATION_TICK_INTERVAL_MS = GAME_MS_PER_DAY;
export const MIN_INFLATION_BPS = -300;
export const MAX_INFLATION_BPS = 1200;
export const MIN_PRICE_INDEX_BPS = 5000;
export const MAX_PRICE_INDEX_BPS = 30_000;

export type InflationPhase = 'stable' | 'rise' | 'fall' | 'spike' | 'crash';

export interface InflationTickResult {
  inflationRateBps: number;
  priceIndexBps: number;
  lastInflationTickGameMs: number;
  phase: InflationPhase;
  deltaInflationBps: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Autonomous world inflation — evolves without player actions. */
export function evolveWorldInflation(input: {
  currentInflationBps: number;
  currentPriceIndexBps: number;
  lastInflationTickGameMs: number;
  gameTimeMs: number;
}): InflationTickResult | null {
  if (input.gameTimeMs - input.lastInflationTickGameMs < INFLATION_TICK_INTERVAL_MS) {
    return null;
  }

  const ticks = Math.floor(
    (input.gameTimeMs - input.lastInflationTickGameMs) / INFLATION_TICK_INTERVAL_MS,
  );
  if (ticks <= 0) return null;

  let inflation = input.currentInflationBps;
  let priceIndex = input.currentPriceIndexBps;
  let lastTick = input.lastInflationTickGameMs;
  let phase: InflationPhase = 'stable';
  let deltaInflation = 0;

  for (let i = 0; i < ticks; i += 1) {
    lastTick += INFLATION_TICK_INTERVAL_MS;
    const seed = createHash('sha256').update(`world-inflation:${lastTick}`).digest();
    const roll = seed[0]! / 255;

    let delta = Math.round((roll - 0.5) * 80);
    if (inflation > 400) delta -= 15;
    if (inflation < 50) delta += 10;

    if (roll > 0.97) {
      delta += 120;
      phase = 'spike';
    } else if (roll < 0.03) {
      delta -= 100;
      phase = 'crash';
    } else if (delta > 20) {
      phase = 'rise';
    } else if (delta < -20) {
      phase = 'fall';
    } else {
      phase = 'stable';
    }

    inflation = clamp(inflation + delta, MIN_INFLATION_BPS, MAX_INFLATION_BPS);
    deltaInflation = delta;
    priceIndex = clamp(
      Math.round((priceIndex * (10_000 + inflation)) / 10_000),
      MIN_PRICE_INDEX_BPS,
      MAX_PRICE_INDEX_BPS,
    );
  }

  return {
    inflationRateBps: inflation,
    priceIndexBps: priceIndex,
    lastInflationTickGameMs: lastTick,
    phase,
    deltaInflationBps: deltaInflation,
  };
}
