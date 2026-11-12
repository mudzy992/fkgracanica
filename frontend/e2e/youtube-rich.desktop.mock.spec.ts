import type { Page } from '@playwright/test';
import { test, expect } from './support/mock-fixture.ts';
import { expectNoSeriousA11y } from './support/a11y.ts';

async function mockRichNews(page: Page, html: string) {
  await page.route('**/api/v1/news/slug/fe06-rich', (route) => route.fulfill({ json: {
    id: 'fe06-rich', slug: 'fe06-rich', title: 'Rich test', content: html, videoUrl: null,
    relatedMatches: [], relatedPlayers: [],
  } }));
  await page.route('**/api/v1/news/fe06-rich/comments', (route) => route.fulfill({ json: [] }));
}

test('nesiguran YouTube iframe ne stvara nikakav vanjski zahtjev ni promjenu pohranjenog HTML-a', async ({ page, isolated }) => {
  const original = '<p>Tekst vijesti</p><iframe title="Nesiguran" src="https://www.youtube.com/embed/../../redirect?q=https://example.invalid/"></iframe>';
  await mockRichNews(page, original);
  await page.goto('/vijesti/fe06-rich');
  await expect(page.getByText('Tekst vijesti')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Ugrađeni video nije dostupan');
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(isolated.blocked.filter((origin) => /youtube|example\.invalid/i.test(origin))).toEqual([]);
  expect(isolated.calls.some((call) => /^(POST|PATCH|PUT|DELETE) \/news/.test(call))).toBe(false);
  await expectNoSeriousA11y(page, 'neispravan ugrađeni video');
});

test('nocookie playlist i Vimeo ostaju, a mreža je izolovano blokirana', async ({ page, isolated }) => {
  await mockRichNews(page, '<p>Tekst</p><iframe title="Playlist" src="https://www.youtube-nocookie.com/embed/videoseries?list=PLabcdef12345678&amp;index=2"></iframe><iframe title="Vimeo" src="https://player.vimeo.com/video/12345"></iframe>');
  await page.goto('/vijesti/fe06-rich');
  await expect(page.locator('iframe[title="Playlist"]')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/videoseries?list=PLabcdef12345678&index=2');
  await expect(page.locator('iframe[title="Vimeo"]')).toHaveAttribute('src', 'https://player.vimeo.com/video/12345');
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect.poll(() => isolated.blocked.includes('https://www.youtube-nocookie.com')).toBe(true);
  await expect.poll(() => isolated.blocked.includes('https://player.vimeo.com')).toBe(true);
});

test('query s redirekcijom se izbacuje iz inače validnog embeda', async ({ page, isolated }) => {
  await mockRichNews(page, '<iframe title="Validan" src="https://www.youtube.com/embed/abc123XYZ01?start=5&amp;q=https://example.invalid/"></iframe>');
  await page.goto('/vijesti/fe06-rich');
  await expect(page.locator('iframe[title="Validan"]')).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123XYZ01?start=5');
  await expect.poll(() => isolated.blocked.includes('https://www.youtube.com')).toBe(true);
  expect(isolated.blocked).not.toContain('https://example.invalid');
});
