import { randomUUID } from 'node:crypto';
import { NpcTaskTargetResolver } from '../npc/npc-task-target-resolver.js';
import type { NpcRelationshipService } from '../npc/npc-relationship-service.js';
import type { NpcService } from '../npc/npc-service.js';
import type { RiskSpecResolver } from '../risk/risk-spec-resolver.js';
import { defaultRiskSpecResolver } from '../risk/risk-spec-resolver.js';
import type { TaskInstanceContext } from '../effects/effect-types.js';
import { getDefaultTaskDurationMs } from '../../slice/task-timing-constants.js';
import { isDialogueDefinition, isDialogueRootDefinition } from '../../slice/dialogue-routing.js';

export class TaskInstanceMaterializer {
  constructor(
    private readonly npcTargets: NpcTaskTargetResolver,
    private readonly riskSpecResolver: RiskSpecResolver = defaultRiskSpecResolver,
  ) {}

  /** @deprecated use NpcTaskTargetResolver directly in new wiring */
  static fromNpcService(npcService: NpcService, relationships?: NpcRelationshipService) {
    return new TaskInstanceMaterializer(new NpcTaskTargetResolver(npcService, relationships));
  }

  async materialize(input: {
    definitionId: string;
    taskInstanceId: string;
    citizenId: string;
    includeTiming?: boolean;
  }): Promise<{ targetNpcId?: string; context: TaskInstanceContext }> {
    const npcMaterialized = await this.npcTargets.resolve({
      taskDefinitionId: input.definitionId,
      taskInstanceId: input.taskInstanceId,
      citizenId: input.citizenId,
    });
    const resolvedRisk = this.riskSpecResolver.resolveSpecsForTask(input);

    const now = new Date();
    const context: TaskInstanceContext = {
      ...(npcMaterialized?.context ?? {}),
      resolvedAt: now.toISOString(),
    };

    if (resolvedRisk) {
      context.resolvedRisk = resolvedRisk;
    }

    if (!isDialogueDefinition(input.definitionId) && input.includeTiming) {
      const durationMs = getDefaultTaskDurationMs();
      context.timing = {
        startedAt: now.toISOString(),
        readyAt: new Date(now.getTime() + durationMs).toISOString(),
        durationMs,
      };
    }

    if (isDialogueRootDefinition(input.definitionId)) {
      context.dialogueSession = {
        sessionId: randomUUID(),
        rootDefinitionId: input.definitionId,
        stepIndex: 1,
        path: [],
        sessionStartedAt: now.toISOString(),
      };
    }

    return {
      targetNpcId: npcMaterialized?.targetNpcId,
      context,
    };
  }
}
