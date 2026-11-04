import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';

test('CMS lista i builder rade preko dinamičkih ruta i čuvaju uređivanje teksta', async ({ page }) => {
  const cmsPage = {
    id: 'fake-page', slug: 'proba', title: 'Probna stranica', status: 'DRAFT', isSystem: false,
    sections: [{ id: 'section', pageId: 'fake-page', widgetType: 'rich-text', sortOrder: 0, enabled: true, config: { html: '<p>Početni tekst</p>' } }],
  };
  await page.route(/\/api\/v1\/cms\/pages(?:\?.*)?$/, (route) => route.fulfill({ json: [cmsPage] }));
  await page.route('**/api/v1/cms/pages/fake-page', (route) => route.fulfill({ json: cmsPage }));
  await page.route('**/api/v1/cms/widgets', (route) => route.fulfill({ json: [] }));
  await mockLogin(page);
  await page.goto('/admin/cms');
  await expect(page.getByRole('heading', { name: 'CMS stranice' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'CMS stranice' })).toBeVisible();
  await page.getByRole('link', { name: 'Uredi layout' }).click();
  await expect(page).toHaveURL(/\/admin\/cms\/pages\/fake-page$/);
  await expect(page.getByRole('heading', { name: 'Uredi: Probna stranica' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Uredi: Probna stranica' })).toBeVisible();
  await page.getByRole('button', { name: /Tekst blok/ }).click();
  const sheet = page.getByRole('dialog', { name: 'Uredi: Tekst blok' });
  const editor = sheet.locator('.tiptap[contenteditable="true"]');
  await expect(editor).toContainText('Početni tekst');
  await editor.fill('Izmijenjeni tekst');
  await expect(sheet.getByRole('button', { name: 'Sačuvaj sekciju' })).toBeEnabled();
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => { prompts.push(dialog.message()); await dialog.dismiss(); });
  await page.keyboard.press('Escape');
  await expect(sheet).toBeVisible();
  await expect(editor).toContainText('Izmijenjeni tekst');
  expect(prompts).toEqual([]);
});
