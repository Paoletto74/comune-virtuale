import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import type { Database } from '../client.js';
import {
  economicAccounts,
  economicTransferLegs,
  economicTransfers,
} from '../schema/index.js';
import type {
  ApplyCashDeltaInput,
  ApplyCashDeltaResult,
  CreditOwnerInput,
  CreditOwnerResult,
  EconomicAccountRecord,
  EconomicOwnerRef,
  EconomicTransactionRecord,
  EconomicTransferRecord,
  EconomyRepository,
  TransferInput,
  TransferResult,
} from '../../../domain/ports/repositories.js';
import {
  SLICE_GAME_CURRENCY_ID,
  SLICE_STARTER_CASH_MINOR,
  SLICE_STARTER_CASH_REASON,
  SLICE_STARTER_CASH_TRANSACTION_CLASS,
  SLICE_STARTER_CASH_TRANSACTION_TYPE,
  SLICE_SYSTEM_ACCOUNT_ID,
  citizenAccountId,
  economicAccountId,
  starterCashIdempotencyKey,
  starterCashSourceActionId,
} from '../../../slice/economy-constants.js';

export type EconomyDbExecutor = Pick<Database, 'select' | 'insert' | 'update' | 'transaction'>;

function mapAccount(row: typeof economicAccounts.$inferSelect): EconomicAccountRecord {
  return {
    accountId: row.accountId,
    ownerType: row.ownerType as EconomicAccountRecord['ownerType'],
    ownerRef: row.ownerRef,
    currencyId: row.currencyId,
    balanceMinor: row.balanceMinor,
    updatedAt: row.updatedAt,
  };
}

function mapTransfer(row: typeof economicTransfers.$inferSelect): EconomicTransferRecord {
  return {
    transferId: row.transferId,
    idempotencyKey: row.idempotencyKey,
    sourceActionId: row.sourceActionId,
    reasonCode: row.reasonCode,
    transactionType: row.transactionType,
    transactionClass: row.transactionClass,
    amountMinor: row.amountMinor,
    currencyId: row.currencyId,
    status: row.status,
    worldTimeMs: row.worldTimeMs,
    correlationId: row.correlationId,
    createdAt: row.createdAt,
  };
}

function cashDeltaResult(
  transferId: string,
  account: EconomicAccountRecord,
  deltaAppliedMinor: bigint,
  duplicate: boolean,
): ApplyCashDeltaResult {
  return {
    transactionId: transferId,
    balanceMinor: account.balanceMinor,
    currencyId: account.currencyId,
    deltaAppliedMinor,
    duplicate,
  };
}

export class DrizzleEconomyRepository implements EconomyRepository {
  constructor(private readonly db: Database) {}

  async findTransferByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<EconomicTransferRecord | null> {
    return this.findTransferByIdempotencyKeyInExecutor(this.db, idempotencyKey);
  }

  async findTransactionByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<EconomicTransactionRecord | null> {
    const transfer = await this.findTransferByIdempotencyKey(idempotencyKey);
    if (!transfer) return null;

    const legs = await this.db
      .select()
      .from(economicTransferLegs)
      .where(eq(economicTransferLegs.transferId, transfer.transferId));

    const citizenLeg = legs.find((leg) => leg.accountId.startsWith('citizen:'));
    if (!citizenLeg) return null;

    return {
      transactionId: transfer.transferId,
      citizenId: citizenLeg.accountId.replace(/^citizen:/, ''),
      currencyId: transfer.currencyId,
      amountMinor: transfer.amountMinor,
      direction: citizenLeg.direction as 'credit' | 'debit',
      transactionType: transfer.transactionType,
      transactionClass: transfer.transactionClass,
      reasonCode: transfer.reasonCode,
      sourceActionId: transfer.sourceActionId,
      idempotencyKey: transfer.idempotencyKey,
      status: transfer.status,
      worldTimeMs: transfer.worldTimeMs,
      correlationId: transfer.correlationId,
      createdAt: transfer.createdAt,
    };
  }

  async getAccount(citizenId: string): Promise<EconomicAccountRecord | null> {
    return this.getAccountByOwner({ ownerType: 'citizen', ownerRef: citizenId });
  }

  async getAccountByOwner(
    owner: EconomicOwnerRef,
    currencyId = SLICE_GAME_CURRENCY_ID,
  ): Promise<EconomicAccountRecord | null> {
    return this.getAccountByOwnerInExecutor(this.db, owner, currencyId);
  }

  async ensureAccount(
    owner: EconomicOwnerRef,
    currencyId = SLICE_GAME_CURRENCY_ID,
  ): Promise<EconomicAccountRecord> {
    return this.ensureAccountInExecutor(this.db, owner, currencyId);
  }

  async applyCashDelta(input: ApplyCashDeltaInput): Promise<ApplyCashDeltaResult> {
    return this.db.transaction(async (tx) => this.applyCashDeltaInExecutor(tx, input));
  }

  async creditOwner(input: CreditOwnerInput): Promise<CreditOwnerResult> {
    return this.db.transaction(async (tx) => this.creditOwnerInExecutor(tx, input));
  }

  async transfer(input: TransferInput): Promise<TransferResult> {
    return this.db.transaction(async (tx) => this.transferInExecutor(tx, input));
  }

  async grantStarterCash(citizenId: string): Promise<ApplyCashDeltaResult> {
    return this.applyCashDelta({
      citizenId,
      deltaMinor: SLICE_STARTER_CASH_MINOR,
      transactionType: SLICE_STARTER_CASH_TRANSACTION_TYPE,
      transactionClass: SLICE_STARTER_CASH_TRANSACTION_CLASS,
      reasonCode: SLICE_STARTER_CASH_REASON,
      sourceActionId: starterCashSourceActionId(citizenId),
      idempotencyKey: starterCashIdempotencyKey(citizenId),
    });
  }

  async grantStarterCashInTransaction(
    tx: EconomyDbExecutor,
    citizenId: string,
  ): Promise<ApplyCashDeltaResult> {
    return this.applyCashDeltaInExecutor(tx, {
      citizenId,
      deltaMinor: SLICE_STARTER_CASH_MINOR,
      transactionType: SLICE_STARTER_CASH_TRANSACTION_TYPE,
      transactionClass: SLICE_STARTER_CASH_TRANSACTION_CLASS,
      reasonCode: SLICE_STARTER_CASH_REASON,
      sourceActionId: starterCashSourceActionId(citizenId),
      idempotencyKey: starterCashIdempotencyKey(citizenId),
    });
  }

  async ensureAccountInTransaction(
    tx: EconomyDbExecutor,
    owner: EconomicOwnerRef,
    currencyId = SLICE_GAME_CURRENCY_ID,
  ): Promise<EconomicAccountRecord> {
    return this.ensureAccountInExecutor(tx, owner, currencyId);
  }

  private async findTransferByIdempotencyKeyInExecutor(
    executor: EconomyDbExecutor,
    idempotencyKey: string,
  ): Promise<EconomicTransferRecord | null> {
    const rows = await executor
      .select()
      .from(economicTransfers)
      .where(eq(economicTransfers.idempotencyKey, idempotencyKey))
      .limit(1);
    const row = rows[0];
    return row ? mapTransfer(row) : null;
  }

  private async getAccountByOwnerInExecutor(
    executor: EconomyDbExecutor,
    owner: EconomicOwnerRef,
    currencyId: string,
  ): Promise<EconomicAccountRecord | null> {
    const rows = await executor
      .select()
      .from(economicAccounts)
      .where(
        and(
          eq(economicAccounts.ownerType, owner.ownerType),
          eq(economicAccounts.ownerRef, owner.ownerRef),
          eq(economicAccounts.currencyId, currencyId),
        ),
      )
      .limit(1);
    const row = rows[0];
    return row ? mapAccount(row) : null;
  }

  private async ensureAccountInExecutor(
    executor: EconomyDbExecutor,
    owner: EconomicOwnerRef,
    currencyId = SLICE_GAME_CURRENCY_ID,
  ): Promise<EconomicAccountRecord> {
    const existing = await this.getAccountByOwnerInExecutor(executor, owner, currencyId);
    if (existing) {
      return existing;
    }

    const accountId = economicAccountId(owner.ownerType, owner.ownerRef);
    const rows = await executor
      .insert(economicAccounts)
      .values({
        accountId,
        ownerType: owner.ownerType,
        ownerRef: owner.ownerRef,
        currencyId,
        balanceMinor: 0n,
      })
      .returning();

    return mapAccount(rows[0]!);
  }

  private async ensureSystemAccountInExecutor(
    executor: EconomyDbExecutor,
    currencyId: string,
  ): Promise<EconomicAccountRecord> {
    const rows = await executor
      .select()
      .from(economicAccounts)
      .where(eq(economicAccounts.accountId, SLICE_SYSTEM_ACCOUNT_ID))
      .limit(1);

    if (rows[0]) {
      return mapAccount(rows[0]);
    }

    const inserted = await executor
      .insert(economicAccounts)
      .values({
        accountId: SLICE_SYSTEM_ACCOUNT_ID,
        ownerType: 'system',
        ownerRef: currencyId,
        currencyId,
        balanceMinor: 0n,
      })
      .returning();

    return mapAccount(inserted[0]!);
  }

  private async applyCashDeltaInExecutor(
    executor: EconomyDbExecutor,
    input: ApplyCashDeltaInput,
  ): Promise<ApplyCashDeltaResult> {
    const existing = await this.findTransferByIdempotencyKeyInExecutor(
      executor,
      input.idempotencyKey,
    );
    if (existing) {
      const account = await this.getAccountInExecutor(executor, input.citizenId);
      if (!account) {
        throw new Error(`Economic account missing for citizen ${input.citizenId}`);
      }
      return cashDeltaResult(existing.transferId, account, input.deltaMinor, true);
    }

    if (input.deltaMinor === 0n) {
      const account = await this.ensureAccountInExecutor(
        executor,
        { ownerType: 'citizen', ownerRef: input.citizenId },
      );
      return cashDeltaResult('', account, 0n, false);
    }

    const citizenOwner = { ownerType: 'citizen' as const, ownerRef: input.citizenId };
    const citizenAccount = await this.ensureAccountInExecutor(executor, citizenOwner);
    const amountMinor = input.deltaMinor > 0n ? input.deltaMinor : -input.deltaMinor;
    const direction = input.deltaMinor > 0n ? 'credit' : 'debit';
    const newBalance =
      direction === 'credit'
        ? citizenAccount.balanceMinor + amountMinor
        : citizenAccount.balanceMinor - amountMinor;

    if (newBalance < 0n) {
      throw new Error('INSUFFICIENT_CASH');
    }

    const transferId = randomUUID();
    await executor.insert(economicTransfers).values({
      transferId,
      idempotencyKey: input.idempotencyKey,
      sourceActionId: input.sourceActionId,
      reasonCode: input.reasonCode,
      transactionType: input.transactionType,
      transactionClass: input.transactionClass,
      amountMinor,
      currencyId: SLICE_GAME_CURRENCY_ID,
      status: 'completed',
      worldTimeMs: input.worldTimeMs ?? null,
      correlationId: input.correlationId ?? null,
    });

    await executor.insert(economicTransferLegs).values({
      legId: randomUUID(),
      transferId,
      accountId: citizenAccountId(input.citizenId),
      direction,
      amountMinor,
      balanceAfterMinor: newBalance,
    });

    if (input.transactionClass === 'money_creation' && direction === 'credit') {
      await this.ensureSystemAccountInExecutor(executor, SLICE_GAME_CURRENCY_ID);
    }

    const updatedRows = await executor
      .update(economicAccounts)
      .set({ balanceMinor: newBalance, updatedAt: new Date() })
      .where(eq(economicAccounts.accountId, citizenAccount.accountId))
      .returning();

    return cashDeltaResult(
      transferId,
      mapAccount(updatedRows[0]!),
      input.deltaMinor,
      false,
    );
  }

  private async creditOwnerInExecutor(
    executor: EconomyDbExecutor,
    input: CreditOwnerInput,
  ): Promise<CreditOwnerResult> {
    if (input.amountMinor <= 0n) {
      throw new Error('INVALID_CREDIT_AMOUNT');
    }

    const existing = await this.findTransferByIdempotencyKeyInExecutor(
      executor,
      input.idempotencyKey,
    );
    if (existing) {
      const account = await this.ensureAccountInExecutor(executor, input.owner);
      return {
        transactionId: existing.transferId,
        balanceMinor: account.balanceMinor,
        currencyId: account.currencyId,
        amountCreditedMinor: existing.amountMinor,
        duplicate: true,
      };
    }

    const account = await this.ensureAccountInExecutor(executor, input.owner);
    const newBalance = account.balanceMinor + input.amountMinor;
    const transferId = randomUUID();

    await executor.insert(economicTransfers).values({
      transferId,
      idempotencyKey: input.idempotencyKey,
      sourceActionId: input.sourceActionId,
      reasonCode: input.reasonCode,
      transactionType: input.transactionType,
      transactionClass: input.transactionClass,
      amountMinor: input.amountMinor,
      currencyId: SLICE_GAME_CURRENCY_ID,
      status: 'completed',
      worldTimeMs: input.worldTimeMs ?? null,
      correlationId: input.correlationId ?? null,
    });

    await executor.insert(economicTransferLegs).values({
      legId: randomUUID(),
      transferId,
      accountId: account.accountId,
      direction: 'credit',
      amountMinor: input.amountMinor,
      balanceAfterMinor: newBalance,
    });

    if (input.transactionClass === 'money_creation') {
      await this.ensureSystemAccountInExecutor(executor, SLICE_GAME_CURRENCY_ID);
    }

    const updatedRows = await executor
      .update(economicAccounts)
      .set({ balanceMinor: newBalance, updatedAt: new Date() })
      .where(eq(economicAccounts.accountId, account.accountId))
      .returning();

    const updated = mapAccount(updatedRows[0]!);
    return {
      transactionId: transferId,
      balanceMinor: updated.balanceMinor,
      currencyId: updated.currencyId,
      amountCreditedMinor: input.amountMinor,
      duplicate: false,
    };
  }

  private async transferInExecutor(
    executor: EconomyDbExecutor,
    input: TransferInput,
  ): Promise<TransferResult> {
    if (input.amountMinor <= 0n) {
      throw new Error('INVALID_TRANSFER_AMOUNT');
    }

    const existing = await this.findTransferByIdempotencyKeyInExecutor(
      executor,
      input.idempotencyKey,
    );
    if (existing) {
      const sourceAccount = await this.ensureAccountInExecutor(executor, input.from, input.currencyId);
      const destinationAccount = await this.ensureAccountInExecutor(executor, input.to, input.currencyId);
      return {
        transferId: existing.transferId,
        amountMinor: existing.amountMinor,
        currencyId: existing.currencyId,
        sourceBalanceMinor: sourceAccount.balanceMinor,
        destinationBalanceMinor: destinationAccount.balanceMinor,
        duplicate: true,
      };
    }

    const sourceAccount = await this.ensureAccountInExecutor(executor, input.from, input.currencyId);
    const destinationAccount = await this.ensureAccountInExecutor(executor, input.to, input.currencyId);

    if (sourceAccount.balanceMinor < input.amountMinor) {
      throw new Error('INSUFFICIENT_SOURCE_FUNDS');
    }

    const sourceBalanceAfter = sourceAccount.balanceMinor - input.amountMinor;
    const destinationBalanceAfter = destinationAccount.balanceMinor + input.amountMinor;
    const transferId = randomUUID();

    await executor.insert(economicTransfers).values({
      transferId,
      idempotencyKey: input.idempotencyKey,
      sourceActionId: input.sourceActionId,
      reasonCode: input.reasonCode,
      transactionType: input.transactionType,
      transactionClass: input.transactionClass,
      amountMinor: input.amountMinor,
      currencyId: input.currencyId,
      status: 'completed',
      worldTimeMs: input.worldTimeMs ?? null,
      correlationId: input.correlationId ?? null,
    });

    await executor.insert(economicTransferLegs).values([
      {
        legId: randomUUID(),
        transferId,
        accountId: sourceAccount.accountId,
        direction: 'debit',
        amountMinor: input.amountMinor,
        balanceAfterMinor: sourceBalanceAfter,
      },
      {
        legId: randomUUID(),
        transferId,
        accountId: destinationAccount.accountId,
        direction: 'credit',
        amountMinor: input.amountMinor,
        balanceAfterMinor: destinationBalanceAfter,
      },
    ]);

    const updatedSourceRows = await executor
      .update(economicAccounts)
      .set({ balanceMinor: sourceBalanceAfter, updatedAt: new Date() })
      .where(eq(economicAccounts.accountId, sourceAccount.accountId))
      .returning();

    const updatedDestinationRows = await executor
      .update(economicAccounts)
      .set({ balanceMinor: destinationBalanceAfter, updatedAt: new Date() })
      .where(eq(economicAccounts.accountId, destinationAccount.accountId))
      .returning();

    return {
      transferId,
      amountMinor: input.amountMinor,
      currencyId: input.currencyId,
      sourceBalanceMinor: mapAccount(updatedSourceRows[0]!).balanceMinor,
      destinationBalanceMinor: mapAccount(updatedDestinationRows[0]!).balanceMinor,
      duplicate: false,
    };
  }

  private async getAccountInExecutor(
    executor: EconomyDbExecutor,
    citizenId: string,
  ): Promise<EconomicAccountRecord | null> {
    return this.getAccountByOwnerInExecutor(
      executor,
      { ownerType: 'citizen', ownerRef: citizenId },
      SLICE_GAME_CURRENCY_ID,
    );
  }
}
