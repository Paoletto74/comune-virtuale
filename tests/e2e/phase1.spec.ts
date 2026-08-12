import { test, expect } from '@playwright/test';

test('login page loads within app shell', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Comune Virtuale' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Accesso alla Gazzetta' })).toBeVisible();
});

test('status page shows citizen profile', async ({ page }) => {
  const accountId = `e2e-status-${Date.now()}`;

  await page.goto('/login');
  await page.getByLabel('Account dev').fill(accountId);
  await page.getByRole('button', { name: 'Entra' }).click();

  await expect(page.getByRole('heading', { name: 'Creazione del cittadino' })).toBeVisible({
    timeout: 30_000,
  });
  await page.getByLabel('Nome').fill('Paolo Test');
  await page.getByLabel('Età').fill('30');
  await page.getByRole('button', { name: 'Crea il cittadino' }).click();

  await page.getByRole('link', { name: 'Stato' }).click();

  await expect(page.getByRole('heading', { name: 'Stato del cittadino' })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText('Paolo Test')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Profilo' })).toBeVisible();
  await expect(page.getByText('100')).toBeVisible();
});
