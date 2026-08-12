import { describe, expect, it } from 'vitest';
import { resolveDemoStealRequestedAmountMinor } from './demo-steal-amount-resolver.js';

describe('resolveDemoStealRequestedAmountMinor', () => {
  it('returns 50% of wallet (demo policy)', () => {
    expect(resolveDemoStealRequestedAmountMinor(20n)).toBe(10n);
    expect(resolveDemoStealRequestedAmountMinor(40n)).toBe(20n);
    expect(resolveDemoStealRequestedAmountMinor(50n)).toBe(25n);
  });
});
