import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTestApp, loginAs, startStandardTask, withIdempotency, withSession } from '../../test/test-app.js';
import { createDatabase } from '../../infrastructure/db/client.js';
import { DrizzleEconomyRepository } from '../../infrastructure/db/repositories/economy-repository.js';
import { DrizzleTaskRepository } from '../../infrastructure/db/repositories/task-repository.js';
import { resolveDemoElderlyNpcWalletMinor } from '../../application/economy/demo-npc-wallet-seeder.js';
import { resolveDemoStealRequestedAmountMinor } from '../../application/economy/demo-steal-amount-resolver.js';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

const hasDatabase = !!process.env.DATABASE_URL;

describe.skipIf(!hasDatabase)('steal_wallet persistence', () => {
  it('debits NPC wallet and credits player with frozen requested amount', async () => {
    const accountId = `test-steal-persist-${randomUUID()}`;
    const { app, close } = await buildTestApp();
    const { db, client } = createDatabase(process.env.DATABASE_URL!);
    const economyRepo = new DrizzleEconomyRepository(db);
    const taskRepo = new DrizzleTaskRepository(db);

    try {
      const login = await loginAs(app, accountId);
      const create = await app.inject({
        method: 'POST',
        url: '/api/v1/citizens',
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { displayName: 'Steal Persist', gender: 'female', age: 29 },
      });
      const { demoTaskInstanceId, citizenId } = create.json() as {
        demoTaskInstanceId: string;
        citizenId: string;
      };

      const task = await taskRepo.findById(demoTaskInstanceId);
      expect(task?.targetNpcId).toBeTruthy();

      const walletMinor = resolveDemoElderlyNpcWalletMinor(demoTaskInstanceId);
      const requestedMinor = resolveDemoStealRequestedAmountMinor(walletMinor);

      const npcBefore = await economyRepo.getAccountByOwner({
        ownerType: 'npc',
        ownerRef: task!.targetNpcId!,
      });
      expect(npcBefore?.balanceMinor).toBe(walletMinor);

      await startStandardTask(app, login.sessionCookie, demoTaskInstanceId);

      const commit = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'steal_wallet' },
      });
      expect(commit.statusCode).toBe(200);

      const complete = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
        headers: {
          ...withSession(login.sessionCookie),
          ...withIdempotency(randomUUID()),
        },
        payload: { optionId: 'steal_wallet' },
      });
      expect(complete.statusCode).toBe(200);

      const npcAfter = await economyRepo.getAccountByOwner({
        ownerType: 'npc',
        ownerRef: task!.targetNpcId!,
      });
      const playerAfter = await economyRepo.getAccount(citizenId);

      expect(npcAfter?.balanceMinor).toBe(walletMinor - requestedMinor);
      expect(playerAfter?.balanceMinor).toBe(100n + requestedMinor);
    } finally {
      await app.close();
      await close();
      await client.end();
    }
  });
});
