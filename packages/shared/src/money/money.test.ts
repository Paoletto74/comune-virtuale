import { describe, expect, it } from 'vitest';
import { addMoney, createMoney, moneyFromMinorString } from './money.js';

describe('Money', () => {
  it('creates money with bigint minor units', () => {
    const m = createMoney(1000n, 'EUR');
    expect(m.amountMinor).toBe(1000n);
    expect(m.currency).toBe('EUR');
  });

  it('parses from string without precision loss', () => {
    const m = moneyFromMinorString('999999999999999', 'EUR');
    expect(m.amountMinor).toBe(999999999999999n);
  });

  it('adds same currency', () => {
    const result = addMoney(createMoney(100n, 'EUR'), createMoney(50n, 'EUR'));
    expect(result.amountMinor).toBe(150n);
  });

  it('rejects negative amounts', () => {
    expect(() => createMoney(-1n, 'EUR')).toThrow();
  });
});
