import { test, expect } from './support/mock-fixture.ts';
import { editor, nocookie, paste, unsafe } from './support/youtube-tiptap.ts';

test('toolbar odbija neispravnu adresu i prihvata valjanu playlistu', async ({ page }) => {
  await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  page.once('dialog', (dialog) => void dialog.accept(unsafe));
  await page.getByRole('button', { name: 'Video', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('ispravan YouTube');
  await expect(page.locator('.tiptap iframe')).toHaveCount(0);
  page.once(
    'dialog',
    (dialog) => void dialog.accept('https://www.youtube.com/playlist?list=PLabcdef12345678'),
  );
  await page.getByRole('button', { name: 'Video', exact: true }).click();
  await expect(page.locator('.tiptap iframe')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/videoseries?list=PLabcdef12345678',
  );
});

test('paste odbija unsafe HTML iframe bez vanjskog zahtjeva i bez upisa iframea', async ({
  page,
}) => {
  const { external, writes } = await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  await paste(page, {
    html: `<div data-youtube-video=""><iframe src="${unsafe}" onload="alert(1)"></iframe></div>`,
    text: unsafe,
  });
  await expect(page.locator('.tiptap')).toContainText('Ugrađeni video nije dostupan');
  await expect(page.locator('.tiptap iframe')).toHaveCount(0);
  expect(external).toEqual([]);
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(String(writes[0].content)).not.toContain('redirect');
  expect(String(writes[0].content)).not.toContain('onload');
});

test('paste valjane HTML playliste i običnog YouTube linka kreira siguran embed', async ({
  page,
}) => {
  await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  await paste(page, {
    html: `<div data-youtube-video=""><iframe title="Playlist" src="${nocookie.replaceAll('&', '&amp;')}" onload="alert(1)"></iframe></div>`,
    text: nocookie,
  });
  await expect(page.locator('.tiptap iframe[title="Playlist"]')).toHaveAttribute('src', nocookie);
  await expect(page.locator('.tiptap iframe')).toHaveCount(1);
  await paste(page, { text: 'https://youtu.be/abc123XYZ01' });
  await expect(page.locator('.tiptap iframe')).toHaveCount(2);
  await expect(
    page.locator('.tiptap iframe[src="https://www.youtube.com/embed/abc123XYZ01"]'),
  ).toHaveCount(1);
});

test('neispravan običan URL pri paste ostaje tekst i ne stvara iframe', async ({ page }) => {
  const { external } = await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  await paste(page, { text: 'https://notyoutube.com/watch?v=abc123XYZ01' });
  await expect(page.locator('.tiptap')).toContainText('https://notyoutube.com/watch?v=abc123XYZ01');
  await expect(page.locator('.tiptap iframe')).toHaveCount(0);
  expect(external).toEqual([]);
});

test('novi HTML paste čisti srcdoc i događaje sa iframea i njegovog omotača', async ({ page }) => {
  const { writes } = await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  const html =
    '<div data-youtube-video="" onclick="alert(1)"><iframe src="https://www.youtube.com/embed/abc123XYZ01" srcdoc="&lt;script&gt;parent.__p22Executed=true&lt;/script&gt;" onload="alert(1)"></iframe></div>';
  await paste(page, { html, text: 'https://www.youtube.com/embed/abc123XYZ01' });
  const frame = page.locator('.tiptap iframe');
  await expect(frame).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123XYZ01');
  await expect(frame).not.toHaveAttribute('srcdoc');
  await expect(frame).not.toHaveAttribute('onload');
  await expect(frame.locator('..')).not.toHaveAttribute('onclick');
  expect(
    await page.evaluate(() => (window as unknown as { __p22Executed?: boolean }).__p22Executed),
  ).not.toBe(true);
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  const saved = String(writes[0].content);
  expect(saved).not.toContain('srcdoc');
  expect(saved).not.toContain('onload');
  expect(saved).not.toContain('onclick');
});

test('paste bez čitljivog Clipboard API-ja se sigurno zaustavlja uz objašnjenje', async ({
  page,
}) => {
  const { external } = await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  await page.locator('.tiptap p').first().click();
  const prevented = await page.evaluate(() => {
    const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
    document.querySelector('.tiptap')!.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(prevented).toBe(true);
  await expect(page.getByRole('alert')).toContainText(
    'preglednik ne omogućava sigurno lijepljenje',
  );
  expect(external).toEqual([]);
});

test('lijepljenje kao običan tekst ne ubacuje HTML iframe', async ({ page }) => {
  const { external } = await editor(page, '<p>Dovoljno dug tekst vijesti.</p>');
  await page.locator('.tiptap p').first().click();
  await page.evaluate((url) => {
    const target = document.querySelector('.tiptap')!;
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'V', ctrlKey: true, shiftKey: true, bubbles: true }),
    );
    const data = new DataTransfer();
    data.setData('text/html', `<iframe src="${url}"></iframe>`);
    data.setData('text/plain', 'Običan tekst');
    target.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
    );
  }, unsafe);
  await expect(page.locator('.tiptap')).toContainText('Običan tekst');
  await expect(page.locator('.tiptap iframe')).toHaveCount(0);
  expect(external).toEqual([]);
});
