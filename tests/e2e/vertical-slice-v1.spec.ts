import { randomUUID } from 'node:crypto';
import { test, expect, type Page } from '@playwright/test';

interface HomeResponse {
  displayName: string;
  personalValues: { sympathy: number; reputation: number };
  balance: { availableCash: { amountMinor: string } };
  activeTasks: Array<{
    taskInstanceId: string;
    taskId: string;
    title: string;
    description: string;
    taskKind?: string;
    feedState?: string;
    options: Array<{ optionId: string; label: string }>;
  }>;
}

async function fetchHome(page: Page): Promise<HomeResponse> {
  let home: HomeResponse | null = null;

  await expect
    .poll(
      async () => {
        const result = await page.evaluate(async () => {
          const response = await fetch('/api/v1/home', { credentials: 'include' });
          if (!response.ok) return { ok: false as const, status: response.status };
          const data = (await response.json()) as HomeResponse;
          return { ok: true as const, data };
        });
        if (!result.ok) return null;
        home = result.data;
        return result.data;
      },
      { timeout: 30_000 },
    )
    .not.toBeNull();

  return home!;
}

async function loginAndCreateCitizen(
  page: Page,
  accountId: string,
  displayName: string,
  age: string,
) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Accesso alla Gazzetta' })).toBeVisible();

  await page.getByLabel('Account dev').fill(accountId);
  await page.getByRole('button', { name: 'Entra' }).click();

  await expect(page.getByRole('heading', { name: 'Creazione del cittadino' })).toBeVisible({
    timeout: 30_000,
  });

  await page.getByLabel('Nome').fill(displayName);
  await page.getByLabel('Età').fill(age);
  await page.getByRole('button', { name: 'Crea il cittadino' }).click();

  await expectDashboardReady(page);
}

async function expectDashboardReady(page: Page) {
  await expect(page.getByRole('heading', { name: 'Cronaca del cittadino' })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole('region', { name: 'Profilo' })).toBeVisible();
}

function idleTaskMessage(page: Page) {
  return page.getByText('Nessuna attività in corso.', { exact: true });
}

async function completeTaskViaApi(page: Page, optionId: string) {
  await expect
    .poll(
      async () => {
        return page.evaluate(async (selectedOptionId) => {
          const isStandard = (entry: HomeResponse['activeTasks'][number]) =>
            entry.taskKind === 'standard' || !entry.taskKind;

          const homeResponse = await fetch('/api/v1/home', { credentials: 'include' });
          if (!homeResponse.ok) {
            return { ok: false as const, retry: false, status: homeResponse.status };
          }
          const home = (await homeResponse.json()) as HomeResponse;
          const task =
            home.activeTasks.find((entry) => entry.taskId === 'DEMO_BOSS_GREETING') ??
            home.activeTasks.find((entry) => isStandard(entry)) ??
            home.activeTasks[0];
          if (!task) {
            return { ok: false as const, retry: false, status: 404 };
          }

          if (isStandard(task) && task.feedState === 'in_progress') {
            return { ok: false as const, retry: true, status: 102 };
          }

          if (isStandard(task) && task.feedState === 'available') {
            const startResponse = await fetch(`/api/v1/tasks/${task.taskInstanceId}/start`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': crypto.randomUUID(),
              },
              body: JSON.stringify({}),
            });
            if (!startResponse.ok && startResponse.status !== 409) {
              return { ok: false as const, retry: true, status: startResponse.status };
            }
            return { ok: false as const, retry: true, status: startResponse.status };
          }

          if (
            isStandard(task) &&
            (task.feedState === 'interactive' || task.feedState === 'ready')
          ) {
            const completeResponse = await fetch(`/api/v1/tasks/${task.taskInstanceId}/complete`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': crypto.randomUUID(),
              },
              body: JSON.stringify({ optionId: selectedOptionId }),
            });

            if (completeResponse.ok) {
              const body = (await completeResponse.json()) as { taskWaiting?: boolean };
              if (body.taskWaiting) {
                return { ok: false as const, retry: true, status: completeResponse.status };
              }
              return { ok: true as const };
            }

            if (completeResponse.status === 409) {
              return { ok: false as const, retry: true, status: completeResponse.status };
            }

            return { ok: false as const, retry: false, status: completeResponse.status };
          }

          const completeResponse = await fetch(`/api/v1/tasks/${task.taskInstanceId}/complete`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': crypto.randomUUID(),
            },
            body: JSON.stringify({ optionId: selectedOptionId }),
          });

          if (completeResponse.ok) {
            return { ok: true as const };
          }

          if (completeResponse.status === 409) {
            return { ok: false as const, retry: true, status: completeResponse.status };
          }

          return { ok: false as const, retry: false, status: completeResponse.status };
        }, optionId);
      },
      { timeout: 90_000 },
    )
    .toMatchObject({ ok: true });
}

async function completeFirstAvailableTaskOnPage(page: Page) {
  const startCard = page
    .locator('.feedCard')
    .filter({ has: page.getByRole('button', { name: 'Avvia' }) })
    .first();
  await expect(startCard).toBeVisible();
  await startCard.getByRole('button', { name: 'Avvia' }).click();

  await expect
    .poll(async () => {
      const home = await fetchHome(page);
      return home.activeTasks.filter((task) => task.feedState === 'interactive').length;
    })
    .toBeGreaterThan(0);

  const interactive = (await fetchHome(page)).activeTasks.find(
    (task) => task.feedState === 'interactive',
  )!;
  const card = page.locator('.feedCard').filter({
    has: page.getByRole('heading', { name: interactive.title, exact: true }),
  });
  await expect(card).toBeVisible();

  const optionButton = card.locator('.feedOptionList .feedButton').first();
  await expect(optionButton).toBeVisible();
  await optionButton.click();

  await expect(page.getByRole('heading', { name: 'Esito' })).toBeVisible({ timeout: 35_000 });
  await expect(page.locator('.outcomeSummary')).toBeVisible();
}

async function advanceUntilBossDialogue(page: Page) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const home = await fetchHome(page);
    const task = home.activeTasks.find((entry) => entry.taskId === 'DEMO_BOSS_GREETING') ?? home.activeTasks[0];
    if (!task) {
      throw new Error('Nessun task attivo mentre si cerca il dialogo col capo');
    }
    if (task.taskId === 'DEMO_BOSS_GREETING') {
      await expect(page.locator('.dialogueCard')).toBeVisible();
      return task;
    }

    const preferred =
      task.options.find((opt) => opt.optionId === 'ignore') ??
      task.options.find((opt) => opt.optionId === 'refuse') ??
      task.options.find((opt) => opt.optionId === 'return_wallet') ??
      task.options[0];
    expect(preferred).toBeTruthy();
    await completeTaskViaApi(page, preferred!.optionId);
    await page.goto('/dashboard');
    await expectDashboardReady(page);
  }

  throw new Error('Dialogo col capo non raggiunto');
}

test.describe('Vertical Slice V1', () => {
  test('login → create citizen → complete first task → outcome → reload persists state', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const accountId = `e2e-${randomUUID()}`;

    await loginAndCreateCitizen(page, accountId, 'E2E Cittadino', '30');

    const homeBefore = await fetchHome(page);
    expect(homeBefore.activeTasks.length).toBeGreaterThan(0);

    await completeFirstAvailableTaskOnPage(page);

    const homeAfter = await fetchHome(page);
    const valuesChanged =
      homeAfter.personalValues.sympathy !== homeBefore.personalValues.sympathy ||
      homeAfter.personalValues.reputation !== homeBefore.personalValues.reputation ||
      homeAfter.balance.availableCash.amountMinor !== homeBefore.balance.availableCash.amountMinor;
    const taskAdvanced = homeBefore.activeTasks.some(
      (beforeTask) =>
        !homeAfter.activeTasks.some((after) => after.taskInstanceId === beforeTask.taskInstanceId),
    );
    expect(valuesChanged || taskAdvanced).toBeTruthy();

    await page.reload();
    await expectDashboardReady(page);

    const homeReloaded = await fetchHome(page);
    expect(homeReloaded.personalValues).toEqual(homeAfter.personalValues);
    expect(homeReloaded.balance.availableCash.amountMinor).toBe(
      homeAfter.balance.availableCash.amountMinor,
    );
  });

  test('boss dialogue: multi-step conversation through to conclusion', async ({ page }) => {
    test.setTimeout(300_000);

    const accountId = `e2e-dialogue-${randomUUID()}`;
    await loginAndCreateCitizen(page, accountId, 'E2E Dialogo', '31');

    const bossStart = await advanceUntilBossDialogue(page);
    expect(bossStart.options.length).toBeGreaterThanOrEqual(3);
    expect(bossStart.taskKind).toBe('dialogue_step');

    const dialogueLabels = [
      'Chiedo scusa sinceramente e spiego cosa è successo.',
      'Mi offro di recuperare il tempo perso.',
      'Prometto di migliorare e rispettare gli orari.',
      'Concludi la conversazione',
    ];

    for (const label of dialogueLabels) {
      const card = page.locator('.dialogueCard').first();
      await expect(card).toBeVisible();
      await card.getByRole('button', { name: label }).click();

      if (label !== 'Concludi la conversazione') {
        await expect(page.getByRole('heading', { name: 'Esito' })).not.toBeVisible();
        await expect(page.locator('.dialogueCard')).toBeVisible();
      }
    }

    await expect(page.getByRole('heading', { name: 'Esito' })).toBeVisible();
    await expect(page.locator('.outcomeSummary')).toBeVisible();

    const homeAfter = await fetchHome(page);
    expect(homeAfter.activeTasks.length).toBeGreaterThan(0);
  });

  test('session loop: completes tasks until pool exhausted', async ({ page }) => {
    test.setTimeout(300_000);

    const accountId = `e2e-loop-${randomUUID()}`;

    await loginAndCreateCitizen(page, accountId, 'E2E Loop', '28');

    let completed = 0;

    while (completed < 20) {
      const home = await fetchHome(page);
      if (home.activeTasks.length === 0) {
        break;
      }

      const task = home.activeTasks[0]!;

      if (task.taskId === 'DEMO_BOSS_GREETING') {
        for (const optionId of ['blame_traffic', 'change_subject', 'conclude']) {
          await completeTaskViaApi(page, optionId);
        }
      } else {
        const preferred =
          task.options.find((opt) => opt.optionId === 'ignore') ??
          task.options.find((opt) => opt.optionId === 'refuse') ??
          task.options.find((opt) => opt.optionId === 'return_wallet') ??
          task.options[0];
        expect(preferred).toBeTruthy();
        await completeTaskViaApi(page, preferred!.optionId);
      }

      await page.goto('/dashboard');
      await expectDashboardReady(page);
      completed += 1;
    }

    expect(completed).toBeGreaterThanOrEqual(5);

    await expect(idleTaskMessage(page)).toBeVisible();

    const homeFinal = await fetchHome(page);
    expect(homeFinal.activeTasks).toHaveLength(0);
  });
});
