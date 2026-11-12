import { readFileSync } from 'node:fs';
import { test, expect } from './support/mock-fixture.ts';

test.use({ serviceWorkers: 'allow' });

const manifest = JSON.parse(readFileSync(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8')) as Record<string, { file: string; isDynamicEntry?: boolean }>;
const entry = manifest['src/pages/admin/gallery/GalleryEditorPage.tsx'];
if (!entry?.isDynamicEntry) throw new Error('Galerija nije dinamički route entry');

test('stvarni service worker ignoriše stari 404 za chunk i oporavlja cache', async ({ page }) => {
  await page.goto('/prijava');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const path = `/${entry.file}`;
  const status = await page.evaluate(async (asset) => {
    const cache = await caches.open('fk-gracanica-v3');
    await cache.put(asset, new Response('stari 404', { status: 404 }));
    return (await fetch(asset)).status;
  }, path);
  expect(status).toBe(200);
  await expect.poll(() => page.evaluate(async (asset) => (await caches.match(asset))?.status, path)).toBe(200);
});
