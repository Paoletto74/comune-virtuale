import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDatabase } from '../../infrastructure/db/client.js';
import { DrizzleEconomyRepository } from '../../infrastructure/db/repositories/economy-repository.js';
import { DrizzleNpcRepository } from '../../infrastructure/db/repositories/npc-repository.js';
import { EconomyService } from '../economy/economy-service.js';
import { AppError } from '../../api/plugins/error-handler-plugin.js';
import {
  SLICE_GAME_CURRENCY_ID,
  SLICE_TRANSFER_TRANSACTION_CLASS,
  transferIdempotencyKey,
} from '../../slice/economy-constants.js';

config({ path: resolve(import.meta.dirname, '../../../../../.env') });

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('EconomyService.transfer', () => {
  async function createHarness() {
    const { db, client } = createDatabase(process.env.DATABASE_URL!);
    const economyRepo = new DrizzleEconomyRepository(db);
    const npcRepo = new DrizzleNpcRepository(db);
    const economyService = new EconomyService(economyRepo);
    return {
      economyRepo,
      npcRepo,
      economyService,
      async close() {
        await client.end();
      },
    };
  }

  async function seedCitizen(
    economyRepo: DrizzleEconomyRepository,
    citizenId: string,
    balanceMinor: bigint,
  ) {
    await economyRepo.ensureAccount({ ownerType: 'citizen', ownerRef: citizenId });
    if (balanceMinor > 0n) {
      await economyRepo.applyCashDelta({
        citizenId,
        deltaMinor: balanceMinor,
        transactionType: 'systemGrant',
        transactionClass: 'money_creation',
        reasonCode: 'TEST_SEED',
        sourceActionId: `test-seed:${citizenId}`,
        idempotencyKey: `test-seed:${citizenId}`,
      });
    }
  }

  function transferRequest(input: {
    from: { ownerType: 'citizen' | 'npc'; ownerRef: string };
    to: { ownerType: 'citizen' | 'npc'; ownerRef: string };
    amountMinor: bigint;
    sourceActionId: string;
    reasonCode?: string;
    idempotencyKey?: string;
  }) {
    return {
      from: input.from,
      to: input.to,
      amountMinor: input.amountMinor,
      currencyId: SLICE_GAME_CURRENCY_ID,
      transactionType: 'transfer',
      transactionClass: SLICE_TRANSFER_TRANSACTION_CLASS,
      reasonCode: input.reasonCode ?? 'TEST_TRANSFER',
      sourceActionId: input.sourceActionId,
      idempotencyKey: input.idempotencyKey ?? transferIdempotencyKey(input.sourceActionId),
    };
  }

  it('transfers cash citizen → citizen', async () => {
    const harness = await createHarness();
    const sourceCitizenId = randomUUID();
    const destCitizenId = randomUUID();
    const sourceActionId = `test:${randomUUID()}`;

    try {
      await seedCitizen(harness.economyRepo, sourceCitizenId, 100n);
      await seedCitizen(harness.economyRepo, destCitizenId, 0n);

      const result = await harness.economyService.transfer(
        transferRequest({
          from: { ownerType: 'citizen', ownerRef: sourceCitizenId },
          to: { ownerType: 'citizen', ownerRef: destCitizenId },
          amountMinor: 30n,
          sourceActionId,
        }),
      );

      expect(result.amountMinor).toBe('30');
      expect(result.duplicate).toBe(false);

      const source = await harness.economyRepo.getAccount(sourceCitizenId);
      const dest = await harness.economyRepo.getAccount(destCitizenId);
      expect(source?.balanceMinor).toBe(70n);
      expect(dest?.balanceMinor).toBe(30n);
    } finally {
      await harness.close();
    }
  });

  it('transfers cash NPC → citizen', async () => {
    const harness = await createHarness();
    const npcId = randomUUID();
    const funderCitizenId = randomUUID();
    const recipientCitizenId = randomUUID();
    const sourceActionId = `test:${randomUUID()}`;

    try {
      await harness.npcRepo.create({ npcId, ageCategory: 'elderly' });
      await harness.economyRepo.ensureAccount({ ownerType: 'npc', ownerRef: npcId });
      await seedCitizen(harness.economyRepo, funderCitizenId, 100n);
      await seedCitizen(harness.economyRepo, recipientCitizenId, 0n);

      await harness.economyService.transfer(
        transferRequest({
          from: { ownerType: 'citizen', ownerRef: funderCitizenId },
          to: { ownerType: 'npc', ownerRef: npcId },
          amountMinor: 50n,
          sourceActionId: `fund-npc:${randomUUID()}`,
          reasonCode: 'TEST_FUND_NPC',
        }),
      );

      const result = await harness.economyService.transfer(
        transferRequest({
          from: { ownerType: 'npc', ownerRef: npcId },
          to: { ownerType: 'citizen', ownerRef: recipientCitizenId },
          amountMinor: 20n,
          sourceActionId,
          reasonCode: 'TEST_NPC_TO_CITIZEN',
        }),
      );

      expect(result.amountMinor).toBe('20');

      const npcAccount = await harness.economyRepo.getAccountByOwner({
        ownerType: 'npc',
        ownerRef: npcId,
      });
      const recipient = await harness.economyRepo.getAccount(recipientCitizenId);
      expect(npcAccount?.balanceMinor).toBe(30n);
      expect(recipient?.balanceMinor).toBe(20n);
    } finally {
      await harness.close();
    }
  });

  it('rejects transfer when source has insufficient funds', async () => {
    const harness = await createHarness();
    const sourceCitizenId = randomUUID();
    const destCitizenId = randomUUID();

    try {
      await seedCitizen(harness.economyRepo, sourceCitizenId, 10n);
      await seedCitizen(harness.economyRepo, destCitizenId, 0n);

      await expect(
        harness.economyService.transfer(
          transferRequest({
            from: { ownerType: 'citizen', ownerRef: sourceCitizenId },
            to: { ownerType: 'citizen', ownerRef: destCitizenId },
            amountMinor: 50n,
            sourceActionId: `test:${randomUUID()}`,
          }),
        ),
      ).rejects.toBeInstanceOf(AppError);

      const source = await harness.economyRepo.getAccount(sourceCitizenId);
      const dest = await harness.economyRepo.getAccount(destCitizenId);
      expect(source?.balanceMinor).toBe(10n);
      expect(dest?.balanceMinor).toBe(0n);
    } finally {
      await harness.close();
    }
  });

  it('is idempotent on duplicate transfer key', async () => {
    const harness = await createHarness();
    const sourceCitizenId = randomUUID();
    const destCitizenId = randomUUID();
    const sourceActionId = `test:${randomUUID()}`;
    const request = transferRequest({
      from: { ownerType: 'citizen', ownerRef: sourceCitizenId },
      to: { ownerType: 'citizen', ownerRef: destCitizenId },
      amountMinor: 25n,
      sourceActionId,
    });

    try {
      await seedCitizen(harness.economyRepo, sourceCitizenId, 100n);
      await seedCitizen(harness.economyRepo, destCitizenId, 0n);

      const first = await harness.economyService.transfer(request);
      const second = await harness.economyService.transfer(request);

      expect(first.duplicate).toBe(false);
      expect(second.duplicate).toBe(true);

      const source = await harness.economyRepo.getAccount(sourceCitizenId);
      const dest = await harness.economyRepo.getAccount(destCitizenId);
      expect(source?.balanceMinor).toBe(75n);
      expect(dest?.balanceMinor).toBe(25n);
    } finally {
      await harness.close();
    }
  });

  it('rejects zero and negative transfer amounts', async () => {
    const harness = await createHarness();
    const sourceCitizenId = randomUUID();
    const destCitizenId = randomUUID();

    try {
      await seedCitizen(harness.economyRepo, sourceCitizenId, 100n);
      await seedCitizen(harness.economyRepo, destCitizenId, 0n);

      await expect(
        harness.economyService.transfer(
          transferRequest({
            from: { ownerType: 'citizen', ownerRef: sourceCitizenId },
            to: { ownerType: 'citizen', ownerRef: destCitizenId },
            amountMinor: 0n,
            sourceActionId: `test-zero:${randomUUID()}`,
          }),
        ),
      ).rejects.toBeInstanceOf(AppError);

      await expect(
        harness.economyService.transfer(
          transferRequest({
            from: { ownerType: 'citizen', ownerRef: sourceCitizenId },
            to: { ownerType: 'citizen', ownerRef: destCitizenId },
            amountMinor: -5n,
            sourceActionId: `test-negative:${randomUUID()}`,
          }),
        ),
      ).rejects.toBeInstanceOf(AppError);
    } finally {
      await harness.close();
    }
  });

  it('rolls back atomically when source funds are insufficient', async () => {
    const harness = await createHarness();
    const sourceCitizenId = randomUUID();
    const destCitizenId = randomUUID();

    try {
      await seedCitizen(harness.economyRepo, sourceCitizenId, 15n);
      await seedCitizen(harness.economyRepo, destCitizenId, 5n);

      await expect(
        harness.economyRepo.transfer(
          transferRequest({
            from: { ownerType: 'citizen', ownerRef: sourceCitizenId },
            to: { ownerType: 'citizen', ownerRef: destCitizenId },
            amountMinor: 20n,
            sourceActionId: `test-rollback:${randomUUID()}`,
          }),
        ),
      ).rejects.toThrow('INSUFFICIENT_SOURCE_FUNDS');

      const source = await harness.economyRepo.getAccount(sourceCitizenId);
      const dest = await harness.economyRepo.getAccount(destCitizenId);
      expect(source?.balanceMinor).toBe(15n);
      expect(dest?.balanceMinor).toBe(5n);
    } finally {
      await harness.close();
    }
  });
});
