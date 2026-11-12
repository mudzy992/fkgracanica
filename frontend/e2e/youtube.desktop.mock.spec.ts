import type { Page } from '@playwright/test';
import { test, expect } from './support/mock-fixture.ts';
import { expectNoSeriousA11y } from './support/a11y.ts';
import { setupLineupMock } from './support/lineup-mock.ts';
import { mockLogin } from './support/login.ts';

async function mockNews(page: Page, baseURL: string, videoUrl: string) {
  await page.route(`${baseURL}/api/v1/news/slug/fe06-video`, (route) => route.fulfill({ json: {
    id: 'fe06-video', slug: 'fe06-video', title: 'Testni video', content: '<p>Izolovana vijest</p>', videoUrl,
    relatedMatches: [], relatedPlayers: [],
  } }));
  await page.route(`${baseURL}/api/v1/news/fe06-video/comments`, (route) => route.fulfill({ json: [] }));
}

for (const unsafe of [
  'https://notyoutube.com/watch?v=abc123XYZ01',
  'https://youtube.com/watch?v=..%2F..%2Fredirect%3Fq%3Dhttps%3A%2F%2Fexample.invalid',
]) {
  test(`stari nesigurni link ne kreira iframe ni mrežni poziv: ${unsafe}`, async ({ page, baseURL, isolated }) => {
    await mockNews(page, baseURL!, unsafe);
    await page.goto('/vijesti/fe06-video');
    await expect(page.getByRole('heading', { name: 'Testni video' })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('Provjerite YouTube link');
    await expect(page.locator('iframe')).toHaveCount(0);
    expect(isolated.blocked.filter((origin) => /youtube|example\.invalid/i.test(origin))).toEqual([]);
    await expectNoSeriousA11y(page, 'neispravan YouTube link');
  });
}

test('valjani live link koristi kanonski iframe; vanjska mreža je izolovana', async ({ page, baseURL, isolated }) => {
  await mockNews(page, baseURL!, 'https://youtube.com/live/abc123XYZ01');
  await page.goto('/vijesti/fe06-video');
  const frame = page.locator('iframe[title="Testni video"]');
  await expect(frame).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123XYZ01');
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect.poll(() => isolated.blocked.includes('https://www.youtube.com')).toBe(true);
});


test('editor highlighta odbija lažni URL i šalje samo ispravni skraćeni link', async ({ page }) => {
  await setupLineupMock(page, 'default');
  const requests: object[] = [];
  await page.route('**/api/v1/matches/lineup-match/highlights', async (route) => {
    if (route.request().method() !== 'POST') throw new Error('Neočekivani highlight zahtjev');
    requests.push(route.request().postDataJSON() as object);
    await route.fulfill({ json: { id: 'new-highlight' } });
  });
  await mockLogin(page);
  await page.goto('/admin/seasons/calendar/competitions/edition?roundId=round');
  await page.getByRole('cell', { name: 'Uredi Postava Obriši' }).getByRole('button', { name: 'Uredi', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Uredi utakmicu' });
  await dialog.getByPlaceholder('Naslov klipa').fill('Gol');
  await dialog.getByPlaceholder('YouTube URL').fill('https://notyoutube.com/watch?v=abc123XYZ01');
  await dialog.getByRole('button', { name: 'Dodaj klip' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Unesite ispravan YouTube link');
  expect(requests).toEqual([]);
  await dialog.getByPlaceholder('YouTube URL').fill('https://youtu.be/abc123XYZ01');
  await dialog.getByRole('button', { name: 'Dodaj klip' }).click();
  await expect.poll(() => requests.length).toBe(1);
  expect(requests[0]).toEqual({ title: 'Gol', youtubeUrl: 'https://youtu.be/abc123XYZ01' });
  await expect(dialog.getByPlaceholder('YouTube URL')).toHaveValue('');
});
