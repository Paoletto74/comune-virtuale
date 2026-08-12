import { describe, expect, it } from 'vitest';
import { capTransferAmount } from '../effects/effect-applicator.js';

describe('capTransferAmount', () => {
  it('caps to available source balance', () => {
    expect(capTransferAmount(25n, 50n)).toBe(25n);
    expect(capTransferAmount(25n, 10n)).toBe(10n);
    expect(capTransferAmount(25n, 0n)).toBe(0n);
  });
});
