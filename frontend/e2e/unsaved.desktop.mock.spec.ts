import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';
import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';

async function mockMedia(page: Page) {
  let asset = { id: 'fake-asset', filename: 'test.jpg', originalPath: 'test.jpg', mimeType: 'image/jpeg', size: 1024 };
  const saved: string[] = [];
  await page.route('**/api/v1/media/assets*', (route) => route.fulfill({ json: { data: [asset], meta: { total: 1, page: 1, totalPages: 1, limit: 20 } } }));
  await page.route('**/api/v1/media/assets/fake-asset', async (route) => {
    if (route.request().method() !== 'PATCH') throw new Error('Neočekivana testna mutacija medija');
    const input = route.request().postDataJSON() as { filename: string };
    saved.push(input.filename);
    asset = { ...asset, filename: input.filename };
    await route.fulfill({ json: asset });
  });
  await page.route('**/api/v1/uploads/files/**', (route) => route.fulfill({
    contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64'),
  }));
  return saved;
}

async function editFilename(page: Page, value: string) {
  await page.getByRole('button', { name: 'Uredi', exact: true }).click();
  const form = page.getByRole('dialog', { name: 'Uredi medij' });
  const input = form.locator('input').first();
  await expect(input).toHaveValue('test.jpg');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  await input.fill(value);
  return { form, input };
}

async function navigatePaletteToNews(page: Page) {
  await page.keyboard.press('Control+k');
  const palette = page.getByRole('dialog', { name: 'Pretraga admina' });
  const input = palette.getByRole('combobox');
  await expect(input).toBeFocused();
  await input.fill('vijesti');
  await expect(input).toHaveValue('vijesti');
  const first = palette.getByRole('option').first();
  await expect(first).toContainText('Vijesti');
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await input.press('Enter');
}

test('paleta: odbijanje čuva formu, prihvatanje napušta bez izmjene servera', async ({ page }) => {
  const saved = await mockMedia(page);
  await mockLogin(page);
  await page.goto('/admin/media');
  const { form, input } = await editFilename(page, 'izmjena.jpg');
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => {
    prompts.push(dialog.message());
    if (prompts.length === 1) await dialog.dismiss();
    else await dialog.accept();
  });
  await navigatePaletteToNews(page);
  await expect.poll(() => prompts.length).toBe(1);
  await expect(page).toHaveURL(/\/admin\/media$/);
  await expect(form).toBeVisible();
  await expect(input).toHaveValue('izmjena.jpg');
  await navigatePaletteToNews(page);
  await expect(page).toHaveURL(/\/admin\/news$/);
  expect(prompts).toHaveLength(2);
  expect(saved).toEqual([]);
});

test('Back/Forward: odbijanje vraća URL i formu; prihvatanje nastavlja', async ({ page }) => {
  const saved = await mockMedia(page);
  await mockLogin(page);
  await page.goto('/admin/media');
  await page.goto('/admin/news');
  await page.goBack();
  await expect(page).toHaveURL(/\/admin\/media$/);
  const { input } = await editFilename(page, 'historija.jpg');
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => {
    prompts.push(dialog.message());
    if (prompts.length < 3) await dialog.dismiss();
    else await dialog.accept();
  });
  await page.evaluate(() => history.back());
  await expect.poll(() => prompts.length).toBe(1);
  await expect(page).toHaveURL(/\/admin\/media$/);
  await expect(input).toHaveValue('historija.jpg');
  await page.evaluate(() => history.forward());
  await expect.poll(() => prompts.length).toBe(2);
  await expect(page).toHaveURL(/\/admin\/media$/);
  await expect(input).toHaveValue('historija.jpg');
  await page.evaluate(() => history.back());
  await expect(page).toHaveURL(/\/admin$/);
  expect(prompts).toHaveLength(3);
  expect(saved).toEqual([]);
});

test('uspješno spremanje i čista forma ne stvaraju lažno upozorenje', async ({ page }) => {
  const saved = await mockMedia(page);
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => { prompts.push(dialog.message()); await dialog.dismiss(); });
  await mockLogin(page);
  await page.goto('/admin/media');
  await page.getByRole('button', { name: 'Uredi', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Uredi medij' }).locator('input').first()).toHaveValue('test.jpg');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  await navigatePaletteToNews(page);
  await expect(page).toHaveURL(/\/admin\/news$/);
  expect(prompts).toEqual([]);
  await page.goto('/admin/media');
  const { form } = await editFilename(page, 'sacuvano.jpg');
  await form.getByRole('button', { name: 'Sačuvaj' }).click();
  await expect(form).toHaveCount(0);
  expect(saved).toEqual(['sacuvano.jpg']);
  await navigatePaletteToNews(page);
  await expect(page).toHaveURL(/\/admin\/news$/);
  expect(prompts).toEqual([]);
});

test('reload: odbijanje čuva nespremljenu formu, prihvatanje osvježava stranicu', async ({ page }) => {
  const saved = await mockMedia(page);
  await mockLogin(page);
  await page.goto('/admin/media');
  const { input } = await editFilename(page, 'reload.jpg');
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => {
    prompts.push(dialog.type());
    if (prompts.length === 1) await dialog.dismiss();
    else await dialog.accept();
  });
  await page.evaluate(() => location.reload());
  await expect.poll(() => prompts.length).toBe(1);
  await expect(input).toHaveValue('reload.jpg');
  const loaded = page.waitForEvent('load');
  await page.evaluate(() => location.reload());
  await loaded;
  expect(prompts).toEqual(['beforeunload', 'beforeunload']);
  expect(saved).toEqual([]);
  await page.getByRole('button', { name: 'Uredi', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Uredi medij' }).locator('input').first()).toHaveValue('test.jpg');
});


test('nespremljena forma blokira lazy rutu prije učitavanja chunka', async ({ page }) => {
  const manifest = JSON.parse(readFileSync(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8')) as Record<string, { file: string }>;
  const target = `/${manifest['src/pages/admin/TicketingAdminPage.tsx'].file}`;
  const requested: string[] = [];
  page.on('request', (request) => requested.push(new URL(request.url()).pathname));
  const saved = await mockMedia(page);
  await page.route('**/api/v1/ticketing/admin/orders', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/v1/ticketing/config', (route) => route.fulfill({ json: {} }));
  await mockLogin(page);
  await page.goto('/admin/media');
  const { form, input } = await editFilename(page, 'lazy-izmjena.jpg');
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => {
    prompts.push(dialog.message());
    if (prompts.length === 1) await dialog.dismiss();
    else await dialog.accept();
  });
  async function navigateToTickets() {
    await page.keyboard.press('Control+k');
    const palette = page.getByRole('dialog', { name: 'Pretraga admina' });
    const search = palette.getByRole('combobox');
    await expect(search).toBeFocused();
    await search.fill('ulaznice');
    const first = palette.getByRole('option').first();
    await expect(first).toContainText('Ulaznice');
    await expect(first).toHaveAttribute('aria-selected', 'true');
    await search.press('Enter');
  }
  await navigateToTickets();
  await expect.poll(() => prompts.length).toBe(1);
  await expect(page).toHaveURL(/\/admin\/media$/);
  await expect(form).toBeVisible();
  await expect(input).toHaveValue('lazy-izmjena.jpg');
  expect(requested).not.toContain(target);
  const configLoaded = page.waitForResponse((response) => response.url().includes('/api/v1/ticketing/config'));
  await navigateToTickets();
  await expect(page).toHaveURL(/\/admin\/ticketing$/);
  await expect(page.getByRole('heading', { name: 'Ulaznice' })).toBeVisible();
  expect((await configLoaded).ok()).toBe(true);
  await expect(page.getByText('Nema narudžbi.')).toBeVisible();
  expect(requested).toContain(target);
  expect(prompts).toHaveLength(2);
  expect(saved).toEqual([]);
});
