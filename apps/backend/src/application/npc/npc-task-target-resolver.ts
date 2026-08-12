import type { TaskInstanceContext } from '../effects/effect-types.js';
import type { NpcRelationshipService } from './npc-relationship-service.js';
import type { NpcService } from './npc-service.js';
import { getNpcTaskBinding } from '../../slice/npc-relationship-constants.js';
import { seedDemoStealWalletContext } from './demo-steal-wallet-context.js';

export interface MaterializedTaskTarget {
  targetNpcId: string;
  context: TaskInstanceContext;
}

export class NpcTaskTargetResolver {
  constructor(
    private readonly npcService: NpcService,
    private readonly relationships?: NpcRelationshipService,
  ) {}

  async resolve(input: {
    taskDefinitionId: string;
    taskInstanceId: string;
    citizenId: string;
  }): Promise<MaterializedTaskTarget | null> {
    const binding = getNpcTaskBinding(input.taskDefinitionId);
    if (binding && this.relationships) {
      const { npc, presentation } = await this.relationships.materializePersistentNpc({
        definitionId: input.taskDefinitionId,
        taskInstanceId: input.taskInstanceId,
        citizenId: input.citizenId,
        binding,
      });

      let context: TaskInstanceContext = {
        targetNpcId: npc.npcId,
        targetRuleRef: binding.targetRuleRef,
        npcPresentation: presentation,
        resolvedAt: new Date().toISOString(),
      };

      if (binding.seedStealWallet) {
        const stealContext = await seedDemoStealWalletContext({
          npcId: npc.npcId,
          taskDefinitionId: input.taskDefinitionId,
          taskInstanceId: input.taskInstanceId,
          citizenId: input.citizenId,
          targetRuleRef: binding.targetRuleRef,
          economy: this.npcService.economy,
        });
        context = { ...context, ...stealContext, npcPresentation: presentation };
      }

      return {
        targetNpcId: npc.npcId,
        context,
      };
    }

    return this.npcService.materializeTaskTarget(input);
  }
}
