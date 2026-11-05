import type { Page } from '@playwright/test';
import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';
import { setupMediaUploadMock } from './support/media-upload-mock.ts';

async function openMedia(page: Page) {
  await mockLogin(page);
  await page.goto('/admin/media');
  await page.getByRole('button', { name: /^Fotografije\s*0$/ }).click();
  await expect(page.getByRole('button', { name: /Upload u/ })).toBeEnabled();
}

async function choose(page: Page, names: string[]) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /Upload u/ }).click();
  await (await chooser).setFiles(names.map((name) => ({
    name, mimeType: 'image/jpeg', buffer: Buffer.from('synthetic'),
  })));
}

test('odbijeni reload čuva aktivni red; nakon završetka nema upozorenja', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdUploads: [1] });
  await openMedia(page);
  await choose(page, ['first.jpg', 'second.jpg']);
  await expect.poll(() => mock.posts.length).toBe(1);
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => { prompts.push(dialog.type()); await dialog.dismiss(); });
  await page.evaluate(() => location.reload());
  await expect.poll(() => prompts.length).toBe(1);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '2');
  expect(mock.posts.map((item) => item.name)).toEqual(['first.jpg']);
  mock.releaseUpload(1);
  await expect(page.getByRole('status')).toContainText('2/2 uspješno');
  const loaded = page.waitForEvent('load');
  await page.evaluate(() => location.reload());
  await loaded;
  expect(prompts).toEqual(['beforeunload']);
  expect(mock.posts.map((item) => item.name)).toEqual(['first.jpg', 'second.jpg']);
});

test('upozorenje ostaje aktivno nakon SPA navigacije iz biblioteke medija', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdUploads: [1] });
  await openMedia(page);
  await choose(page, ['first.jpg', 'second.jpg']);
  await expect.poll(() => mock.posts.length).toBe(1);
  await page.getByRole('link', { name: 'Vijesti', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/news/);
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => { prompts.push(dialog.type()); await dialog.dismiss(); });
  await page.evaluate(() => location.reload());
  await expect.poll(() => prompts.length).toBe(1);
  await expect(page).toHaveURL(/\/admin\/news/);
  await page.goBack();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '2');
  mock.releaseUpload(1);
  await expect(page.getByRole('status')).toContainText('2/2 uspješno');
  expect(prompts).toEqual(['beforeunload']);
  expect(mock.posts.map((item) => item.name)).toEqual(['first.jpg', 'second.jpg']);
});

test('odbijeno zatvaranje taba zadržava red, a završeni red više ne blokira zatvaranje', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdUploads: [1] });
  await openMedia(page);
  await choose(page, ['first.jpg', 'second.jpg']);
  await expect.poll(() => mock.posts.length).toBe(1);
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => { prompts.push(dialog.type()); await dialog.dismiss(); });
  await page.close({ runBeforeUnload: true });
  await expect.poll(() => prompts.length).toBe(1);
  expect(page.isClosed()).toBe(false);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '2');
  mock.releaseUpload(1);
  await expect(page.getByRole('status')).toContainText('2/2 uspješno');
  await page.close({ runBeforeUnload: true });
  await expect.poll(() => page.isClosed()).toBe(true);
  expect(prompts).toEqual(['beforeunload']);
  expect(mock.posts.map((item) => item.name)).toEqual(['first.jpg', 'second.jpg']);
});

test('prihvaćeni reload nastavlja i ne pohranjuje red fajlova', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdUploads: [1] });
  await openMedia(page);
  await choose(page, ['first.jpg', 'second.jpg']);
  await expect.poll(() => mock.posts.length).toBe(1);
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => { prompts.push(dialog.type()); await dialog.accept(); });
  const loaded = page.waitForEvent('load');
  await page.evaluate(() => location.reload());
  await loaded;
  await expect(page.getByRole('progressbar')).toHaveCount(0);
  expect(prompts).toEqual(['beforeunload']);
  expect(mock.posts.map((item) => item.name)).toEqual(['first.jpg']);
});

test('završno osvježavanje bez aktivnih ili čekajućih POST-ova ne upozorava', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdRefresh: true });
  await openMedia(page);
  await choose(page, ['first.jpg']);
  await expect.poll(() => mock.heldRefresh()).toBe(true);
  await expect(page.getByRole('status')).toContainText('Osvježavanje biblioteke');
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => { prompts.push(dialog.type()); await dialog.dismiss(); });
  const loaded = page.waitForEvent('load');
  await page.evaluate(() => location.reload());
  await loaded;
  expect(prompts).toEqual([]);
  expect(mock.posts.map((item) => item.name)).toEqual(['first.jpg']);
  mock.releaseRefresh();
});
