import { randomUUID } from 'node:crypto';
import { TaskPoolRegistry } from '../application/task/task-pool-registry.js';
import { POOL_AFTER_TASK, POOL_START } from '../slice/task-pool-constants.js';
import { loginAs, withIdempotency, withSession, type TestAppInstance } from './test-app.js';

/** Test-only pool: guarantees one task at onboarding, no random refill. */
export function createSingleStartTaskPoolRegistry(definitionId: string): TaskPoolRegistry {
  const registry = new TaskPoolRegistry();
  registry.register({
    poolId: POOL_START,
    entries: [
      {
        definitionId,
        weight: 100,
        repeatPolicy: 'once',
        enabled: true,
      },
    ],
  });
  registry.register({
    poolId: POOL_AFTER_TASK,
    entries: [],
  });
  return registry;
}

export async function createCitizenWithStartTask(app: TestAppInstance, definitionId: string) {
  const accountId = `test-start-${definitionId}-${randomUUID()}`;
  const login = await loginAs(app, accountId);
  const create = await app.inject({
    method: 'POST',
    url: '/api/v1/citizens',
    headers: {
      ...withSession(login.sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { displayName: 'Start Task Test', gender: 'male', age: 32 },
  });
  if (create.statusCode !== 200) {
    throw new Error(`Citizen creation failed with status ${create.statusCode}`);
  }

  const home = await app.inject({
    method: 'GET',
    url: '/api/v1/home',
    headers: withSession(login.sessionCookie),
  });
  const body = home.json() as {
    citizenId: string;
    activeTasks: Array<{ taskId: string; taskInstanceId: string }>;
  };

  const task = body.activeTasks.find((entry) => entry.taskId === definitionId);
  if (!task) {
    throw new Error(`Expected ${definitionId} in active tasks`);
  }

  return {
    accountId,
    sessionCookie: login.sessionCookie,
    citizenId: body.citizenId,
    taskInstanceId: task.taskInstanceId,
    task,
  };
}
