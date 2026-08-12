import { randomUUID } from 'node:crypto';
import type { TaskInstanceMaterializer } from '../application/task/task-instance-materializer.js';
import type { TaskRepository } from '../domain/ports/repositories.js';
import { DEMO_NEIGHBOR_FAVOR_DEFINITION_ID } from '../slice/c3-pilot-tasks-constants.js';
import { withSession, type TestAppInstance } from './test-app.js';
import {
  createCitizenWithStartTask,
  createSingleStartTaskPoolRegistry,
} from './task-selection-test-helpers.js';

/** Test-only pool: guarantees DEMO_NEIGHBOR_FAVOR at onboarding, no random refill. */
export function createNeighborFavorOnlyPoolRegistry() {
  return createSingleStartTaskPoolRegistry(DEMO_NEIGHBOR_FAVOR_DEFINITION_ID);
}

export async function createCitizenWithNeighborFavorTask(app: TestAppInstance) {
  const rolled = await createCitizenWithStartTask(app, DEMO_NEIGHBOR_FAVOR_DEFINITION_ID);
  const home = await app.inject({
    method: 'GET',
    url: '/api/v1/home',
    headers: withSession(rolled.sessionCookie),
  });
  const body = home.json() as {
    knownNpcs: unknown[];
    activeTasks: Array<{ taskId: string; taskInstanceId: string; npc?: { displayName: string } }>;
  };

  return {
    accountId: rolled.accountId,
    sessionCookie: rolled.sessionCookie,
    citizenId: rolled.citizenId,
    task: body.activeTasks.find((entry) => entry.taskId === DEMO_NEIGHBOR_FAVOR_DEFINITION_ID)!,
    knownNpcs: body.knownNpcs,
  };
}

/** Materializes and persists a task instance using the same path as production spawn. */
export async function spawnTaskInstanceForCitizen(input: {
  taskRepo: TaskRepository;
  materializer: TaskInstanceMaterializer;
  citizenId: string;
  definitionId: string;
}): Promise<string> {
  const taskInstanceId = randomUUID();
  const materialized = await input.materializer.materialize({
    definitionId: input.definitionId,
    taskInstanceId,
    citizenId: input.citizenId,
  });

  await input.taskRepo.createTaskInstance({
    taskInstanceId,
    definitionId: input.definitionId,
    citizenId: input.citizenId,
    targetNpcId: materialized.targetNpcId ?? null,
    context: materialized.context as Record<string, unknown>,
    status: 'pending',
  });

  return taskInstanceId;
}
