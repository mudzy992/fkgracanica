import type { Page } from '@playwright/test';
import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';
import { setupMediaUploadMock } from './support/media-upload-mock.ts';
import { expectNoSeriousA11y } from './support/a11y.ts';

async function chooseFolder(page: Page, name: string) {
  await page.getByRole('button', { name: /^Mapa:/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: new RegExp(`^${name}\\s*0$`) }).click();
}

test('responzivna upload zona prima novi drop tokom uploada i pamti novu mapu', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdUploads: [1] });
  await mockLogin(page);
  await page.goto('/admin/media');
  await chooseFolder(page, 'Fotografije');
  const zone = page.getByRole('button', { name: 'Dodaj slike (galerija ili kamera)' });
  const chooser = page.waitForEvent('filechooser');
  await zone.click();
  await (await chooser).setFiles({ name: 'first.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('synthetic') });
  await expect.poll(() => mock.posts.length).toBe(1);
  await chooseFolder(page, 'Arhiva');
  await expect(zone).toBeEnabled();
  const transfer = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.items.add(new File(['synthetic'], 'second.jpg', { type: 'image/jpeg' }));
    return data;
  });
  await zone.dispatchEvent('drop', { dataTransfer: transfer });
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '2');
  await expectNoSeriousA11y(page, 'responzivni medijski red');
  mock.releaseUpload(1);
  await expect(page.getByRole('status')).toContainText('2/2 uspješno');
  expect(mock.posts).toEqual([
    { name: 'first.jpg', folder: 'folder-a' }, { name: 'second.jpg', folder: 'folder-b' },
  ]);
});
