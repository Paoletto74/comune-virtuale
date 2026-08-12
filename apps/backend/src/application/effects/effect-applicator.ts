import type { EconomyService } from '../economy/economy-service.js';
import type { EffectBundle } from '../effects/effect-types.js';
import {
  SLICE_GAME_CURRENCY_ID,
  SLICE_ZERO_CASH_DELTA,
  taskCashIdempotencyKey,
  taskCashSourceActionId,
  transferIdempotencyKey,
} from '../../slice/economy-constants.js';

export interface AppliedEconomicResult {
  cashDeltaMinor: bigint;
  balance: Awaited<ReturnType<EconomyService['getBalance']>>;
}

export async function applyEconomicEffect(
  economy: EconomyService,
  input: {
    bundle: EffectBundle;
    citizenId: string;
    taskInstanceId: string;
    optionId: string;
    correlationId?: string;
  },
): Promise<AppliedEconomicResult> {
  const { bundle, citizenId, taskInstanceId, optionId } = input;
  const sourceActionId = taskCashSourceActionId(taskInstanceId, optionId);

  if (bundle.economic.kind === 'cash_delta') {
    if (bundle.economic.deltaMinor === SLICE_ZERO_CASH_DELTA) {
      const balance = await economy.getBalance(citizenId);
      return { cashDeltaMinor: 0n, balance };
    }

    const balance = await economy.applyCashDelta({
      citizenId,
      deltaMinor: bundle.economic.deltaMinor,
      transactionType: bundle.economic.transactionType,
      transactionClass: bundle.economic.transactionClass,
      reasonCode: bundle.economic.reasonCode,
      sourceActionId,
      idempotencyKey: taskCashIdempotencyKey(taskInstanceId, optionId),
      correlationId: input.correlationId,
    });

    return { cashDeltaMinor: bundle.economic.deltaMinor, balance };
  }

  if (bundle.economic.kind === 'transfer') {
    const sourceBalance = await economy.getOwnerBalance(bundle.economic.from);
    const requestedMinor = bundle.economic.amountMinor;
    const actualMinor = capTransferAmount(requestedMinor, sourceBalance);

    let playerReceived = 0n;
    if (actualMinor > 0n) {
      const transfer = await economy.transfer({
        from: bundle.economic.from,
        to: bundle.economic.to,
        amountMinor: actualMinor,
        currencyId: SLICE_GAME_CURRENCY_ID,
        transactionType: bundle.economic.transactionType,
        transactionClass: bundle.economic.transactionClass,
        reasonCode: bundle.economic.reasonCode,
        sourceActionId,
        idempotencyKey: transferIdempotencyKey(sourceActionId),
        correlationId: input.correlationId,
      });

      playerReceived =
        bundle.economic.to.ownerType === 'citizen' && bundle.economic.to.ownerRef === citizenId
          ? BigInt(transfer.amountMinor)
          : 0n;
    }

    const balance = await economy.getBalance(citizenId);
    return { cashDeltaMinor: playerReceived, balance };
  }

  const balance = await economy.getBalance(citizenId);
  return { cashDeltaMinor: 0n, balance };
}

/** cap-to-available policy — actual transfer never exceeds source balance. */
export function capTransferAmount(requestedMinor: bigint, sourceBalanceMinor: bigint): bigint {
  return sourceBalanceMinor < requestedMinor ? sourceBalanceMinor : requestedMinor;
}
