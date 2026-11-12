import { test, expect } from './support/mock-fixture.ts';
import { editor, legacyHtml, unsafe } from './support/youtube-tiptap.ts';

test('kopiranje legacy sadržaja bez Clipboard API-ja ne umeće unsafe iframe u živi DOM', async ({
  page,
}) => {
  const { external } = await editor(
    page,
    `<p>Dovoljno dug tekst vijesti.</p><iframe src="${unsafe}"></iframe>`,
  );
  await page.locator('.tiptap p').first().click();
  await page.keyboard.press('Control+A');
  await page.evaluate(() => {
    document
      .querySelector('.tiptap')!
      .dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(350);
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(external).toEqual([]);
});

test('kopiranje u Clipboard API ne iznosi nesigurne iframe atribute', async ({ page }) => {
  const { external } = await editor(page, legacyHtml);
  await page.locator('.tiptap p').first().click();
  await page.keyboard.press('Control+A');
  const copied = await page.evaluate(() => {
    const data = new DataTransfer();
    document
      .querySelector('.tiptap')!
      .dispatchEvent(
        new ClipboardEvent('copy', { clipboardData: data, bubbles: true, cancelable: true }),
      );
    return data.getData('text/html');
  });
  expect(copied).toContain('Ugrađeni video nije dostupan');
  expect(copied).not.toContain('redirect');
  expect(copied).not.toContain('<iframe');
  expect(external).toEqual([]);
});
