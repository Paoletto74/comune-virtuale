import { describe, expect, it, vi } from 'vitest';
import { EconomyService } from './economy-service.js';
import type { EconomyRepository } from '../../domain/ports/repositories.js';
import {
  SLICE_GAME_CURRENCY_ID,
  SLICE_STARTER_CASH_MINOR,
  starterCashIdempotencyKey,
} from '../../slice/economy-constants.js';

function createMockEconomy(): EconomyRepository {
  let balance = 0n;
  const idempotencyKeys = new Set<string>();

  const accountRecord = () =>
    balance > 0n
      ? {
          accountId: 'citizen:cit-1',
          ownerType: 'citizen' as const,
          ownerRef: 'cit-1',
          currencyId: SLICE_GAME_CURRENCY_ID,
          balanceMinor: balance,
          updatedAt: new Date(),
        }
      : null;

  return {
    findTransferByIdempotencyKey: vi.fn(async (key: string) =>
      idempotencyKeys.has(key) ? ({} as never) : null,
    ),
    findTransactionByIdempotencyKey: vi.fn(async (key: string) =>
      idempotencyKeys.has(key) ? ({} as never) : null,
    ),
    getAccount: vi.fn(async () => accountRecord()),
    getAccountByOwner: vi.fn(async () => accountRecord()),
    ensureAccount: vi.fn(async () => accountRecord() ?? {
      accountId: 'citizen:cit-1',
      ownerType: 'citizen' as const,
      ownerRef: 'cit-1',
      currencyId: SLICE_GAME_CURRENCY_ID,
      balanceMinor: 0n,
      updatedAt: new Date(),
    }),
    applyCashDelta: vi.fn(async (input) => {
      if (idempotencyKeys.has(input.idempotencyKey)) {
        return {
          transactionId: 'tx-dup',
          balanceMinor: balance,
          currencyId: SLICE_GAME_CURRENCY_ID,
          deltaAppliedMinor: input.deltaMinor,
          duplicate: true,
        };
      }
      idempotencyKeys.add(input.idempotencyKey);
      balance += input.deltaMinor;
      return {
        transactionId: 'tx-1',
        balanceMinor: balance,
        currencyId: SLICE_GAME_CURRENCY_ID,
        deltaAppliedMinor: input.deltaMinor,
        duplicate: false,
      };
    }),
    creditOwner: vi.fn(),
    transfer: vi.fn(),
    grantStarterCash: vi.fn(async (citizenId: string) => {
      const key = starterCashIdempotencyKey(citizenId);
      if (idempotencyKeys.has(key)) {
        return {
          transactionId: 'tx-dup',
          balanceMinor: balance,
          currencyId: SLICE_GAME_CURRENCY_ID,
          deltaAppliedMinor: SLICE_STARTER_CASH_MINOR,
          duplicate: true,
        };
      }
      idempotencyKeys.add(key);
      balance = SLICE_STARTER_CASH_MINOR;
      return {
        transactionId: 'tx-starter',
        balanceMinor: balance,
        currencyId: SLICE_GAME_CURRENCY_ID,
        deltaAppliedMinor: SLICE_STARTER_CASH_MINOR,
        duplicate: false,
      };
    }),
  };
}

describe('EconomyService', () => {
  it('returns zero balance when account is missing', async () => {
    const economy = createMockEconomy();
    const service = new EconomyService(economy);

    const balance = await service.getBalance('cit-1');
    expect(balance.availableCash).toEqual({
      amountMinor: '0',
      currency: SLICE_GAME_CURRENCY_ID,
    });
  });

  it('grantStarterCash returns 100 game_currency', async () => {
    const economy = createMockEconomy();
    const service = new EconomyService(economy);

    const balance = await service.grantStarterCash('cit-1');
    expect(balance.availableCash).toEqual({
      amountMinor: '100',
      currency: SLICE_GAME_CURRENCY_ID,
    });
  });

  it('grantStarterCash is idempotent at repository level', async () => {
    const economy = createMockEconomy();
    const service = new EconomyService(economy);

    await service.grantStarterCash('cit-1');
    await service.grantStarterCash('cit-1');

    const balance = await service.getBalance('cit-1');
    expect(balance.availableCash.amountMinor).toBe('100');
    expect(economy.grantStarterCash).toHaveBeenCalledTimes(2);
  });
});
