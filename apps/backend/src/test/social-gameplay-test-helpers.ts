import { vi } from 'vitest';

export const DEFAULT_RELATIONSHIP_METRICS = {
  trust: 50,
  affection: 0,
  conflict: 0,
  familiarity: 0,
  relationshipScore: 0,
  relationshipState: 'conoscenza',
  contactUnlocked: false,
  chatEnabled: false,
} as const;

export function mockApplyPersonalValueEffects(store: Record<string, number>) {
  return vi.fn().mockImplementation(async (_citizenId: string, input: {
    costs?: Record<string, number>;
    deltas?: Record<string, number>;
  }) => {
    const applied: Record<string, number> = {};
    for (const [key, cost] of Object.entries(input.costs ?? {})) {
      store[key] = (store[key] ?? 0) - cost;
      applied[key] = (applied[key] ?? 0) - cost;
    }
    for (const [key, delta] of Object.entries(input.deltas ?? {})) {
      store[key] = (store[key] ?? 0) + delta;
      applied[key] = (applied[key] ?? 0) + delta;
    }
    return { values: { ...store }, applied };
  });
}
