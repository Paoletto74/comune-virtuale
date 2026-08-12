import type { EconomyRepository, NpcRepository } from '../../domain/ports/repositories.js';
import type { TaskInstanceContext } from '../effects/effect-types.js';
import type { RiskSpecResolver } from '../risk/risk-spec-resolver.js';
import { defaultRiskSpecResolver } from '../risk/risk-spec-resolver.js';

export interface MaterializedTaskTarget {
  targetNpcId: string;
  context: TaskInstanceContext;
}

/**
 * Ephemeral NPC materialization disabled — persistent roster templates handle NPC targets.
 */
export class NpcService {
  constructor(
    private readonly npcs: NpcRepository,
    readonly economy: EconomyRepository,
    private readonly riskSpecResolver: RiskSpecResolver = defaultRiskSpecResolver,
  ) {}

  async materializeTaskTarget(_input: {
    taskDefinitionId: string;
    taskInstanceId: string;
    citizenId: string;
  }): Promise<MaterializedTaskTarget | null> {
    return null;
  }
}
