import { createMoney, serializeMoney } from '@comune-virtuale/shared';
import type { EconomyRepository, TransferInput, EconomicOwnerRef } from '../../domain/ports/repositories.js';
import {
  SLICE_GAME_CURRENCY_ID,
  SLICE_STARTER_CASH_MINOR,
  SLICE_STARTER_CASH_REASON,
  SLICE_STARTER_CASH_TRANSACTION_CLASS,
  SLICE_STARTER_CASH_TRANSACTION_TYPE,
  starterCashIdempotencyKey,
  starterCashSourceActionId,
} from '../../slice/economy-constants.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';

export interface BalanceSummaryDto {
  availableCash: { amountMinor: string; currency: string };
  asOf: string;
}

export interface CashDeltaRequest {
  citizenId: string;
  deltaMinor: bigint;
  transactionType: string;
  transactionClass: string;
  reasonCode: string;
  sourceActionId: string;
  idempotencyKey: string;
  correlationId?: string;
  worldTimeMs?: bigint;
}

export type TransferRequest = TransferInput;

export interface TransferSummaryDto {
  transferId: string;
  amountMinor: string;
  currency: string;
  sourceBalanceMinor: string;
  destinationBalanceMinor: string;
  duplicate: boolean;
}

export class EconomyService {
  constructor(private readonly economy: EconomyRepository) {}

  async getBalance(citizenId: string): Promise<BalanceSummaryDto> {
    const account = await this.economy.getAccount(citizenId);
    const balanceMinor = account?.balanceMinor ?? 0n;
    const currency = account?.currencyId ?? SLICE_GAME_CURRENCY_ID;

    return {
      availableCash: serializeMoney(createMoney(balanceMinor, currency)),
      asOf: new Date().toISOString(),
    };
  }

  async getOwnerBalance(owner: EconomicOwnerRef): Promise<bigint> {
    const account = await this.economy.getAccountByOwner(owner);
    return account?.balanceMinor ?? 0n;
  }

  async grantStarterCash(citizenId: string): Promise<BalanceSummaryDto> {
    await this.economy.grantStarterCash(citizenId);
    return this.getBalance(citizenId);
  }

  async applyCashDelta(request: CashDeltaRequest): Promise<BalanceSummaryDto> {
    try {
      await this.economy.applyCashDelta({
        citizenId: request.citizenId,
        deltaMinor: request.deltaMinor,
        transactionType: request.transactionType,
        transactionClass: request.transactionClass,
        reasonCode: request.reasonCode,
        sourceActionId: request.sourceActionId,
        idempotencyKey: request.idempotencyKey,
        correlationId: request.correlationId,
        worldTimeMs: request.worldTimeMs,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'INSUFFICIENT_CASH') {
        throw new AppError('BUSINESS', 'INSUFFICIENT_CASH', 'error.economy.insufficient_cash');
      }
      throw error;
    }

    return this.getBalance(request.citizenId);
  }

  async transfer(request: TransferRequest): Promise<TransferSummaryDto> {
    try {
      const result = await this.economy.transfer(request);
      return {
        transferId: result.transferId,
        amountMinor: result.amountMinor.toString(),
        currency: result.currencyId,
        sourceBalanceMinor: result.sourceBalanceMinor.toString(),
        destinationBalanceMinor: result.destinationBalanceMinor.toString(),
        duplicate: result.duplicate,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'INSUFFICIENT_SOURCE_FUNDS') {
        throw new AppError(
          'BUSINESS',
          'INSUFFICIENT_SOURCE_FUNDS',
          'error.economy.insufficient_source_funds',
        );
      }
      if (error instanceof Error && error.message === 'INVALID_TRANSFER_AMOUNT') {
        throw new AppError(
          'VALIDATION',
          'INVALID_TRANSFER_AMOUNT',
          'error.economy.invalid_transfer_amount',
        );
      }
      throw error;
    }
  }

  starterCashMinor(): bigint {
    return SLICE_STARTER_CASH_MINOR;
  }

  starterCashMetadata(citizenId: string) {
    return {
      amountMinor: SLICE_STARTER_CASH_MINOR,
      currencyId: SLICE_GAME_CURRENCY_ID,
      transactionType: SLICE_STARTER_CASH_TRANSACTION_TYPE,
      transactionClass: SLICE_STARTER_CASH_TRANSACTION_CLASS,
      reasonCode: SLICE_STARTER_CASH_REASON,
      sourceActionId: starterCashSourceActionId(citizenId),
      idempotencyKey: starterCashIdempotencyKey(citizenId),
    };
  }
}
