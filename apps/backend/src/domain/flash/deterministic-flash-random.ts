import { createHash } from 'node:crypto';

/** Deterministic unit interval [0, 1) from a stable seed string. */
export function deterministicUnit(seed: string): number {
  const digest = createHash('sha256').update(seed).digest();
  const value = digest.readUInt32BE(0);
  return value / 0x1_0000_0000;
}

export function deterministicInt(seed: string, min: number, max: number): number {
  if (max <= min) return min;
  const span = max - min + 1;
  return min + Math.floor(deterministicUnit(seed) * span);
}

export function deterministicPick<T>(seed: string, items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('deterministicPick requires at least one item');
  }
  const index = deterministicInt(seed, 0, items.length - 1);
  return items[index]!;
}

export function deterministicChance(seed: string, probability: number): boolean {
  return deterministicUnit(seed) < probability;
}
