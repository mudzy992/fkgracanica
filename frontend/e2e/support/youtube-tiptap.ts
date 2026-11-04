import type { Page } from '@playwright/test';
import { expect } from './mock-fixture.ts';
import { mockLogin } from './login.ts';

export const unsafe = 'https://www.youtube.com/embed/abc/../../redirect?q=https://example.invalid/';
export const legacyHtml = `<p>Dovoljno dug sadržaj za uređivanje.</p><div data-youtube-video=""><iframe src="${unsafe}" title="Legacy" width="640" height="360"></iframe></div>`;
export const nocookie =
  'https://www.youtube-nocookie.com/embed/videoseries?list=PLabcdef12345678&index=2';

export async function editor(page: Page, content: string) {
  const writes: Record<string, unknown>[] = [];
  const external: string[] = [];
  page.on('request', (request) => {
    if (/^https:\/\/(www\.)?youtube/i.test(request.url())) external.push(request.url());
  });
  await page.route('**/api/v1/gallery*', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/v1/players*', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/v1/news/fe06-editor', async (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({
        json: {
          id: 'fe06-editor',
          title: 'Naslov vijesti',
          slug: 'naslov-vijesti',
          content,
          videoUrl: null,
          tags: [],
        },
      });
    if (route.request().method() !== 'PATCH') throw new Error('Neočekivani news zahtjev');
    writes.push(route.request().postDataJSON() as Record<string, unknown>);
    return route.fulfill({ json: { id: 'fe06-editor' } });
  });
  await mockLogin(page);
  await page.goto('/admin/news/fe06-editor/edit');
  await expect(page.locator('.tiptap[contenteditable="true"]')).toBeVisible();
  return { writes, external };
}

export async function paste(page: Page, content: { html?: string; text?: string }) {
  await page.locator('.tiptap p').first().click();
  await page.evaluate(({ html, text }) => {
    const data = new DataTransfer();
    if (html) data.setData('text/html', html);
    if (text) data.setData('text/plain', text);
    document
      .querySelector('.tiptap')!
      .dispatchEvent(
        new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
      );
  }, content);
}
