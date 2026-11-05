import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';
import { setupMediaUploadMock } from './support/media-upload-mock.ts';

test('uski web: odbijanje reloada zadržava red slika', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdUploads: [1] });
  await mockLogin(page);
  await page.goto('/admin/media');
  await page.getByRole('button', { name: /^Mapa:/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: /^Fotografije\s*0$/ }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Dodaj slike (galerija ili kamera)' }).click();
  await (await chooser).setFiles(['first.jpg', 'second.jpg'].map((name) => ({
    name, mimeType: 'image/jpeg', buffer: Buffer.from('synthetic'),
  })));
  await expect.poll(() => mock.posts.length).toBe(1);
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => { prompts.push(dialog.type()); await dialog.dismiss(); });
  await page.evaluate(() => location.reload());
  await expect.poll(() => prompts.length).toBe(1);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '2');
  mock.releaseUpload(1);
  await expect(page.getByRole('status')).toContainText('2/2 uspješno');
  expect(prompts).toEqual(['beforeunload']);
  expect(mock.posts.map((item) => item.name)).toEqual(['first.jpg', 'second.jpg']);
});
