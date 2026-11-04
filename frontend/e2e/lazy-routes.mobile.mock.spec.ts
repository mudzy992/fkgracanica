import { readFileSync } from 'node:fs';
import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';
import { expectNoSeriousA11y } from './support/a11y.ts';

const manifest = JSON.parse(readFileSync(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8')) as Record<string, { file: string; isDynamicEntry?: boolean }>;
const entry = manifest['src/pages/admin/gallery/GalleryEditorPage.tsx'];
if (!entry?.isDynamicEntry) throw new Error('Galerija nije dinamički route entry');

test('uski web: status učitavanja i meni ostaju dostupni', async ({ page }) => {
  await mockLogin(page);
  let release!: () => void;
  let started!: () => void;
  const wait = new Promise<void>((resolve) => { release = resolve; });
  const requested = new Promise<void>((resolve) => { started = resolve; });
  await page.route(`**/${entry.file}`, async (route) => { started(); await wait; await route.continue(); });
  const navigation = page.goto('/admin/gallery/new', { waitUntil: 'domcontentloaded' });
  try {
    await requested;
    await expect(page.getByRole('status')).toHaveText('Učitavanje...');
    const menu = page.getByRole('button', { name: 'Otvori meni' });
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoSeriousA11y(page, 'uski web status i navigacija tokom učitavanja');
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
  } finally {
    release();
  }
  await navigation;
  await expect(page.getByRole('heading', { name: 'Nova galerija' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Nova galerija' })).toBeVisible();
});
