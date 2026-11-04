import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './support/mock-fixture.ts';
import { editor, legacyHtml, nocookie, unsafe } from './support/youtube-tiptap.ts';

test('legacy iframe se ne učitava, a promjena drugog polja čuva originalni HTML', async ({
  page,
}) => {
  const { writes, external } = await editor(page, legacyHtml);
  await expect(
    page.getByRole('status').filter({ hasText: 'Ugrađeni video nije dostupan' }),
  ).toBeVisible();
  await expect(page.locator('.tiptap iframe')).toHaveCount(0);
  expect(external).toEqual([]);
  await page.locator('input[name="title"]').fill('Izmijenjeni naslov');
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].content).toBe(legacyHtml);
  await page.waitForTimeout(200);
  expect(external).toEqual([]);
});

test('izmjena teksta čuva originalne atribute legacy iframea do ručnog uklanjanja', async ({
  page,
}) => {
  const { writes, external } = await editor(page, legacyHtml);
  await expect(
    page.getByRole('status').filter({ hasText: 'Ugrađeni video nije dostupan' }),
  ).toBeVisible();
  const paragraph = page.locator('.tiptap p').first();
  await paragraph.click();
  await page.keyboard.press('End');
  await page.keyboard.type(' Dodatni tekst.');
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  const saved = String(writes[0].content);
  expect(saved).toContain('Dodatni tekst.');
  expect(saved).toContain(`src="${unsafe.replaceAll('&', '&amp;')}"`);
  expect(saved).toContain('title="Legacy"');
  await page.waitForTimeout(200);
  expect(external).toEqual([]);
});

test('ručno uklanjanje sigurnog placeholdera je moguće', async ({ page }) => {
  const { writes } = await editor(page, legacyHtml);
  const remove = page.getByRole('button', { name: 'Ukloni video' });
  await remove.focus();
  await expect(remove).toBeFocused();
  await remove.press('Enter');
  await expect(
    page.getByRole('status').filter({ hasText: 'Ugrađeni video nije dostupan' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(String(writes[0].content)).not.toContain('iframe');
});

test('ispravna nocookie playlista ostaje nocookie i vidljiva u editoru', async ({
  page,
  isolated,
}) => {
  await editor(
    page,
    `<p>Dovoljno dug sadržaj.</p><div data-youtube-video=""><iframe title="Playlist" src="${nocookie.replaceAll('&', '&amp;')}"></iframe></div>`,
  );
  const frame = page.locator('.tiptap iframe[title="Playlist"]');
  await expect(frame).toHaveAttribute('src', nocookie);
  await expect.poll(() => isolated.blocked.includes('https://www.youtube-nocookie.com')).toBe(true);
});

test('goli legacy iframe ne izvršava srcdoc/onload, a atributi ostaju pri uređivanju teksta', async ({
  page,
}) => {
  const original = `<p>Dovoljno dug tekst vijesti.</p><iframe src="${unsafe}" srcdoc="&lt;script&gt;parent.__p22Executed=true&lt;/script&gt;" onload="window.__p22Executed=true"></iframe>`;
  const { external, writes } = await editor(page, original);
  await expect(page.getByRole('status')).toContainText(
    'Spremljeni sadržaj nije automatski izmijenjen',
  );
  await expect(page.locator('.tiptap iframe')).toHaveCount(0);
  await page.locator('.tiptap p').first().click();
  await page.keyboard.type('Dodatak ');
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  const saved = String(writes[0].content);
  expect(saved).toContain('srcdoc=');
  expect(saved).toContain('onload=');
  expect(saved).toContain('embed/abc/../../redirect');
  expect(
    await page.evaluate(() => (window as unknown as { __p22Executed?: boolean }).__p22Executed),
  ).not.toBe(true);
  expect(external).toEqual([]);
});

test('objašnjenje u editoru prolazi axe i podržava tastaturu', async ({ page }) => {
  await editor(page, legacyHtml);
  const result = await new AxeBuilder({ page })
    .include('.tiptap')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    result.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    ),
  ).toEqual([]);
  const remove = page.getByRole('button', { name: 'Ukloni video' });
  await remove.focus();
  await remove.press('Enter');
  await expect(remove).toHaveCount(0);
});

test('Vimeo iframe u postojećem tekstu ostaje vidljiv i ne mijenja se pri drugoj izmjeni', async ({
  page,
  isolated,
}) => {
  const vimeo = 'https://player.vimeo.com/video/12345';
  const html = `<p>Dovoljno dug tekst vijesti.</p><iframe title="Vimeo" src="${vimeo}"></iframe>`;
  const { writes } = await editor(page, html);
  await expect(page.locator('.tiptap iframe[title="Vimeo"]')).toHaveAttribute('src', vimeo);
  await expect.poll(() => isolated.blocked.includes('https://player.vimeo.com')).toBe(true);
  await page.locator('input[name="title"]').fill('Izmjena naslova');
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].content).toBe(html);
});
