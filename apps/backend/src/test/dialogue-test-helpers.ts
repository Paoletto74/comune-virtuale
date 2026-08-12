import { randomUUID } from 'node:crypto';
import { expect } from 'vitest';
import { startStandardTask, type TestAppInstance, withIdempotency, withSession } from './test-app.js';

type ActiveTask = {
  taskInstanceId: string;
  taskId?: string;
  taskKind?: string;
  feedState?: string;
  status?: string;
};

export async function getActiveTasks(
  app: TestAppInstance,
  sessionCookie: string,
): Promise<ActiveTask[]> {
  const active = await app.inject({
    method: 'GET',
    url: '/api/v1/tasks/active',
    headers: withSession(sessionCookie),
  });
  return (active.json() as { tasks: ActiveTask[] }).tasks;
}

export function pickCompletableTask(tasks: ActiveTask[]): ActiveTask | undefined {
  return (
    tasks.find((task) => task.taskKind === 'dialogue_step' || task.taskKind === 'dialogue_terminal') ??
    tasks.find((task) => task.feedState === 'ready') ??
    tasks.find((task) => task.feedState === 'available' || task.status === 'pending')
  );
}

export async function completeActiveTaskOption(
  app: TestAppInstance,
  sessionCookie: string,
  optionId: string,
) {
  const tasks = await getActiveTasks(app, sessionCookie);
  const task = pickCompletableTask(tasks);
  expect(task).toBeTruthy();

  if (task!.feedState === 'available' || task!.status === 'pending') {
    const started = await startStandardTask(app, sessionCookie, task!.taskInstanceId);
    expect(started.statusCode).toBe(200);
  }

  const commit = await app.inject({
    method: 'POST',
    url: `/api/v1/tasks/${task!.taskInstanceId}/complete`,
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { optionId },
  });

  if (commit.statusCode !== 200) {
    return commit;
  }

  const commitBody = commit.json() as { taskWaiting?: boolean };
  if (!commitBody.taskWaiting) {
    return commit;
  }

  return app.inject({
    method: 'POST',
    url: `/api/v1/tasks/${task!.taskInstanceId}/complete`,
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { optionId },
  });
}

export async function completeDialogueTaskOption(
  app: TestAppInstance,
  sessionCookie: string,
  optionId: string,
) {
  const tasks = await getActiveTasks(app, sessionCookie);
  const task = tasks.find(
    (entry) => entry.taskKind === 'dialogue_step' || entry.taskKind === 'dialogue_terminal',
  );
  expect(task).toBeTruthy();

  return app.inject({
    method: 'POST',
    url: `/api/v1/tasks/${task!.taskInstanceId}/complete`,
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { optionId },
  });
}

export async function walkBossDialoguePath(
  app: TestAppInstance,
  sessionCookie: string,
  optionIds: readonly string[],
) {
  let lastBody: Record<string, unknown> | null = null;

  for (const optionId of optionIds) {
    const response = await completeDialogueTaskOption(app, sessionCookie, optionId);
    expect(response.statusCode).toBe(200);
    lastBody = response.json() as Record<string, unknown>;
  }

  return lastBody;
}

export async function spawnBossDialogue(
  app: TestAppInstance,
  sessionCookie: string,
  demoTaskInstanceId: string,
) {
  const started = await startStandardTask(app, sessionCookie, demoTaskInstanceId);
  expect(started.statusCode).toBe(200);

  const commit = await app.inject({
    method: 'POST',
    url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { optionId: 'ignore' },
  });
  expect(commit.statusCode).toBe(200);

  const finalize = await app.inject({
    method: 'POST',
    url: `/api/v1/tasks/${demoTaskInstanceId}/complete`,
    headers: {
      ...withSession(sessionCookie),
      ...withIdempotency(randomUUID()),
    },
    payload: { optionId: 'ignore' },
  });
  expect(finalize.statusCode).toBe(200);

  return getActiveTasks(app, sessionCookie);
}
