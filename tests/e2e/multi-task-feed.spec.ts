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

async function loginAndCreateCitizen(page: Page, accountId: string) {
  await page.goto('/login');
  await page.getByLabel('Account dev').fill(accountId);
  await page.getByRole('button', { name: 'Entra' }).click();

  await expect(page.getByRole('heading', { name: 'Creazione del cittadino' })).toBeVisible({
    timeout: 30_000,
  });

  await page.getByLabel('Nome').fill('E2E Feed');
  await page.getByLabel('Età').fill('30');
  await page.getByRole('button', { name: 'Crea il cittadino' }).click();

  await expect(page.getByRole('heading', { name: 'Cronaca del cittadino' })).toBeVisible({
    timeout: 30_000,
  });
}

function standardTasks(home: HomeResponse) {
  return home.activeTasks.filter(
    (task) => task.taskKind === 'standard' || !task.taskKind,
  );
}

test.describe('V1-MULTI-TASK-FEED-1', () => {
  test('feed: multiple tasks, parallel start, complete and refill', async ({ page }) => {
    test.setTimeout(90_000);

    const accountId = `e2e-feed-${randomUUID()}`;
    await loginAndCreateCitizen(page, accountId);

    await expect
      .poll(async () => (await fetchHome(page)).activeTasks.length, { timeout: 30_000 })
      .toBeGreaterThanOrEqual(4);

    const homeInitial = await fetchHome(page);
    expect(homeInitial.activeTasks.length).toBeLessThanOrEqual(7);

    await expect(page.locator('.feedList .feedCard')).toHaveCount(homeInitial.activeTasks.length);

    const availableCards = page.locator('.feedCard').filter({ has: page.getByRole('button', { name: 'Avvia' }) });
    await expect(availableCards.first()).toBeVisible();
    const startButtons = availableCards.getByRole('button', { name: 'Avvia' });
    const availableStandard = standardTasks(homeInitial).filter(
      (task) => task.feedState === 'available',
    ).length;
    await expect(startButtons).toHaveCount(availableStandard);

    const firstStart = startButtons.nth(0);
    const secondStart = startButtons.nth(1);
    await firstStart.click();
    await secondStart.click();

    await expect
      .poll(async () => {
        const home = await fetchHome(page);
        const interactive = standardTasks(home).filter((task) => task.feedState === 'interactive');
        return interactive.length;
      })
      .toBeGreaterThanOrEqual(2);

    const homeRunning = await fetchHome(page);
    const interactiveTask = standardTasks(homeRunning).find((task) => task.feedState === 'interactive');
    expect(interactiveTask).toBeTruthy();

    const completedInstanceId = interactiveTask!.taskInstanceId;
    const preferredOption =
      interactiveTask!.options.find((opt) => opt.optionId === 'ignore') ?? interactiveTask!.options[0]!;
    const completedCard = page.locator('.feedCard').filter({
      has: page.getByText(interactiveTask!.description, { exact: true }),
    });

    await completedCard.getByRole('button', { name: preferredOption.label }).click();

    await expect
      .poll(async () => {
        const home = await fetchHome(page);
        return !home.activeTasks.some((task) => task.taskInstanceId === completedInstanceId);
      }, { timeout: 35_000 })
      .toBe(true);

    await expect(page.getByRole('heading', { name: 'Esito' })).toBeVisible({ timeout: 15_000 });

    await expect
      .poll(async () => {
        const home = await fetchHome(page);
        return home.activeTasks.some((task) => task.taskInstanceId === completedInstanceId);
      })
      .toBe(false);

    const homeAfter = await fetchHome(page);
    expect(homeAfter.activeTasks.length).toBeGreaterThanOrEqual(4);
    expect(homeAfter.activeTasks.length).toBeLessThanOrEqual(7);
    expect(new Set(homeAfter.activeTasks.map((task) => task.taskInstanceId)).size).toBe(
      homeAfter.activeTasks.length,
    );
  });
});
