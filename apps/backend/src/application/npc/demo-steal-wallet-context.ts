import type { EconomyRepository } from '../../domain/ports/repositories.js';
import type { TaskInstanceContext } from '../effects/effect-types.js';
import type { RiskSpecResolver } from '../risk/risk-spec-resolver.js';
import { defaultRiskSpecResolver } from '../risk/risk-spec-resolver.js';
import { resolveDemoElderlyNpcWalletMinor } from '../economy/demo-npc-wallet-seeder.js';
import { resolveDemoStealRequestedAmountMinor } from '../economy/demo-steal-amount-resolver.js';
import {
  SLICE_DEMO_STEAL_WALLET_EFFECT_REF,
  SLICE_DEMO_TASK_DEFINITION_ID,
} from '../../slice/constants.js';
import {
  SLICE_NPC_WALLET_SEED_REASON,
  SLICE_NPC_WALLET_SEED_TRANSACTION_TYPE,
  SLICE_STARTER_CASH_TRANSACTION_CLASS,
  npcWalletSeedIdempotencyKey,
  npcWalletSeedSourceActionId,
} from '../../slice/economy-constants.js';

export async function seedDemoStealWalletContext(input: {
  npcId: string;
  taskDefinitionId: string;
  taskInstanceId: string;
  citizenId: string;
  targetRuleRef: string;
  economy: EconomyRepository;
  riskSpecResolver?: RiskSpecResolver;
}): Promise<TaskInstanceContext> {
  const riskSpecResolver = input.riskSpecResolver ?? defaultRiskSpecResolver;

  await input.economy.ensureAccount({ ownerType: 'npc', ownerRef: input.npcId });

  const walletMinor = resolveDemoElderlyNpcWalletMinor(input.taskInstanceId);
  await input.economy.creditOwner({
    owner: { ownerType: 'npc', ownerRef: input.npcId },
    amountMinor: walletMinor,
    transactionType: SLICE_NPC_WALLET_SEED_TRANSACTION_TYPE,
    transactionClass: SLICE_STARTER_CASH_TRANSACTION_CLASS,
    reasonCode: SLICE_NPC_WALLET_SEED_REASON,
    sourceActionId: npcWalletSeedSourceActionId(input.taskInstanceId, input.npcId),
    idempotencyKey: npcWalletSeedIdempotencyKey(input.taskInstanceId, input.npcId),
  });

  const requestedAmountMinor = resolveDemoStealRequestedAmountMinor(walletMinor);

  const resolvedRisk =
    input.taskDefinitionId === SLICE_DEMO_TASK_DEFINITION_ID
      ? riskSpecResolver.resolveSpecsForTask({
          definitionId: input.taskDefinitionId,
          taskInstanceId: input.taskInstanceId,
          citizenId: input.citizenId,
        })
      : null;

  const context: TaskInstanceContext = {
    targetNpcId: input.npcId,
    targetRuleRef: input.targetRuleRef,
    resolvedAt: new Date().toISOString(),
    resolvedEffects: {
      stealWallet: {
        effectSetRef: SLICE_DEMO_STEAL_WALLET_EFFECT_REF,
        from: { ownerType: 'npc', ownerRef: input.npcId },
        to: { ownerType: 'citizen', ownerRef: input.citizenId },
        requestedAmountMinor: requestedAmountMinor.toString(),
        walletAtSpawnMinor: walletMinor.toString(),
        resolutionVersion: 1,
      },
    },
  };

  if (resolvedRisk) {
    context.resolvedRisk = resolvedRisk;
  }

  return context;
}
