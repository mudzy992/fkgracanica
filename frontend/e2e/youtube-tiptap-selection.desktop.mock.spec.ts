import type { Page } from '@playwright/test';
import { test, expect } from './support/mock-fixture.ts';
import { editor, nocookie, paste, unsafe } from './support/youtube-tiptap.ts';

const video = 'https://youtu.be/abc123XYZ01';
const embed = 'https://www.youtube.com/embed/abc123XYZ01';
const playlist = `<div data-youtube-video=""><iframe title="Playlist" src="${nocookie.replaceAll('&', '&amp;')}"></iframe></div>`;

async function insertPlaylist(page: Page) {
  await paste(page, { html: playlist, text: nocookie });
  await expect(page.locator('.tiptap [data-youtube-video]')).toHaveClass(/ProseMirror-selectednode/);
}

/** Change the DOM range and paste in the same task, before a selectionchange can arrive. */
async function pasteImmediately(
  page: Page,
  data: { text: string; html?: string; selection: 'caret' | 'backward' },
) {
  await page.evaluate(({ text, html, selection }) => {
    const root = document.querySelector('.tiptap')!;
    const node = root.querySelector('p')!.firstChild!;
    const domSelection = window.getSelection()!;
    if (selection === 'backward') {
      const index = node.textContent!.indexOf('dug');
      domSelection.setBaseAndExtent(node, index + 3, node, index);
    } else {
      domSelection.collapse(node, node.textContent!.length);
    }
    const clipboard = new DataTransfer();
    clipboard.setData('text/plain', text);
    if (html) clipboard.setData('text/html', html);
    root.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: clipboard, bubbles: true, cancelable: true }),
    );
  }, data);
}

async function savedFrames(page: Page, writes: Record<string, unknown>[]) {
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  return page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return {
      text: doc.body.textContent ?? '',
      frames: Array.from(doc.querySelectorAll('iframe'), (frame) => ({
        title: frame.getAttribute('title'),
        src: frame.getAttribute('src'),
        onload: frame.hasAttribute('onload'),
      })),
    };
  }, String(writes[0].content));
}

test('brzi obični paste u tekst ne zamjenjuje selektovanu playlistu ni u spremljenom sadržaju', async ({ page }) => {
  const { writes } = await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  await insertPlaylist(page);
  await pasteImmediately(page, { text: video, selection: 'caret' });
  await expect(page.locator('.tiptap iframe[title="Playlist"]')).toHaveAttribute('src', nocookie);
  await expect(page.locator(`.tiptap iframe[src="${embed}"]`)).toHaveCount(1);
  await expect(page.locator('.tiptap iframe')).toHaveCount(2);
  const saved = await savedFrames(page, writes);
  expect(saved.frames.find((frame) => frame.title === 'Playlist')?.src).toBe(nocookie);
  expect(saved.frames.some((frame) => frame.src === embed)).toBe(true);
});

test('brzi HTML paste čuva neispravni legacy iframe i sanitizira novi', async ({ page }) => {
  const content = `<p>Dovoljno dug tekst vijesti.</p><div data-youtube-video=""><iframe title="Legacy" src="${unsafe}"></iframe></div>`;
  const { writes } = await editor(page, content);
  const node = page.locator('.tiptap [data-youtube-video]');
  await page.locator('.tiptap p').first().click();
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowRight');
  await expect(node).toHaveClass(/ProseMirror-selectednode/);
  await pasteImmediately(page, {
    html: `<div data-youtube-video=""><iframe src="${embed}" onload="alert(1)"></iframe></div>`,
    text: video,
    selection: 'caret',
  });
  await expect(node.getByRole('status')).toContainText('Ugrađeni video nije dostupan');
  await expect(page.locator(`.tiptap iframe[src="${embed}"]`)).toHaveCount(1);
  const saved = await savedFrames(page, writes);
  expect(saved.frames.find((frame) => frame.title === 'Legacy')?.src).toBe(unsafe);
  expect(saved.frames.find((frame) => frame.src === embed)?.onload).toBe(false);
});

test('paste ne gubi ni prethodnu DOM izmjenu ni postojeći video', async ({ page }) => {
  const { writes } = await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  await insertPlaylist(page);
  await page.evaluate(() => {
    const root = document.querySelector('.tiptap')!;
    const text = root.querySelector('p')!.firstChild!;
    text.textContent += ' dodano';
    window.getSelection()!.collapse(text, text.textContent!.length);
    const clipboard = new DataTransfer();
    clipboard.setData('text/plain', ' i zalijepljeno');
    root.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: clipboard, bubbles: true, cancelable: true }),
    );
  });
  await expect(page.locator('.tiptap p').first()).toHaveText(
    'Dovoljno dug tekst vijesti. dodano i zalijepljeno',
  );
  await expect(page.locator('.tiptap iframe[title="Playlist"]')).toHaveCount(1);
  const saved = await savedFrames(page, writes);
  expect(saved.text).toContain('dodano i zalijepljeno');
  expect(saved.frames.some((frame) => frame.title === 'Playlist')).toBe(true);
});

test('namjerno označeni tekst zamjenjuje se i playlist ostaje', async ({ page }) => {
  const { writes } = await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  await insertPlaylist(page);
  await pasteImmediately(page, { text: 'NOVO', selection: 'backward' });
  await expect(page.locator('.tiptap p').first()).toHaveText('Dovoljno NOVO tekst vijesti.');
  await expect(page.locator('.tiptap iframe[title="Playlist"]')).toHaveCount(1);
  const saved = await savedFrames(page, writes);
  expect(saved.text).toContain('Dovoljno NOVO tekst vijesti.');
  expect(saved.frames.some((frame) => frame.title === 'Playlist')).toBe(true);
});

test('namjerno selektovan video i dalje se može zamijeniti pasteom', async ({ page }) => {
  const { writes } = await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  await insertPlaylist(page);
  await page.evaluate((text) => {
    const clipboard = new DataTransfer();
    clipboard.setData('text/plain', text);
    document.querySelector('.tiptap')!.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: clipboard, bubbles: true, cancelable: true }),
    );
  }, video);
  await expect(page.locator('.tiptap iframe')).toHaveCount(1);
  await expect(page.locator(`.tiptap iframe[src="${embed}"]`)).toHaveCount(1);
  const saved = await savedFrames(page, writes);
  expect(saved.frames.some((frame) => frame.title === 'Playlist')).toBe(false);
  expect(saved.frames.some((frame) => frame.src === embed)).toBe(true);
});

test('stvarni Ctrl+V može zamijeniti namjerno odabrani video', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const { writes } = await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  await insertPlaylist(page);
  await page.evaluate((text) => navigator.clipboard.writeText(text), video);
  await page.keyboard.press('Control+V');
  await expect(page.locator('.tiptap iframe')).toHaveCount(1);
  await expect(page.locator(`.tiptap iframe[src="${embed}"]`)).toHaveCount(1);
  const saved = await savedFrames(page, writes);
  expect(saved.frames.some((frame) => frame.title === 'Playlist')).toBe(false);
  expect(saved.frames.some((frame) => frame.src === embed)).toBe(true);
});

test('brzi paste zamjenjuje odabrani raspon između paragrafa', async ({ page }) => {
  await editor(page, '<p>Alpha</p><p>Omega</p>');
  await page.locator('.tiptap p').first().click();
  await page.evaluate(() => {
    const root = document.querySelector('.tiptap')!;
    const paragraphs = root.querySelectorAll('p');
    window.getSelection()!.setBaseAndExtent(paragraphs[0].firstChild!, 2, paragraphs[1].firstChild!, 3);
    const clipboard = new DataTransfer();
    clipboard.setData('text/plain', 'X');
    root.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: clipboard, bubbles: true, cancelable: true }),
    );
  });
  await expect(page.locator('.tiptap')).toHaveText('AlXga');
});

test('stvarni Ctrl+V nakon klika u tekst čuva oba videa i pri spremanju', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const { writes } = await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  await insertPlaylist(page);
  await page.evaluate((text) => navigator.clipboard.writeText(text), video);
  await page.locator('.tiptap p').first().click();
  await page.keyboard.press('Control+V');
  await expect(page.locator('.tiptap iframe[title="Playlist"]')).toHaveCount(1);
  await expect(page.locator(`.tiptap iframe[src="${embed}"]`)).toHaveCount(1);
  const saved = await savedFrames(page, writes);
  expect(saved.frames.find((frame) => frame.title === 'Playlist')?.src).toBe(nocookie);
  expect(saved.frames.some((frame) => frame.src === embed)).toBe(true);
});
