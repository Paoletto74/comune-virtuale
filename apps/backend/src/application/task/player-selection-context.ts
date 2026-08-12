import type { TaskRepository } from '../../domain/ports/repositories.js';
import type { PlayerSelectionContext } from './task-pool-types.js';

export async function buildPlayerSelectionContext(
  tasks: TaskRepository,
  citizenId: string,
): Promise<PlayerSelectionContext> {
  const instances = await tasks.findAllByCitizenId(citizenId);

  const completedDefinitionIds = new Set<string>();
  const activeOrPendingDefinitionIds = new Set<string>();

  for (const instance of instances) {
    if (instance.status === 'completed') {
      completedDefinitionIds.add(instance.definitionId);
    }

    if (instance.status === 'active' || instance.status === 'pending') {
      activeOrPendingDefinitionIds.add(instance.definitionId);
    }
  }

  return {
    citizenId,
    completedDefinitionIds,
    activeOrPendingDefinitionIds,
  };
}
