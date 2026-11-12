import type { Page } from '@playwright/test';
import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';
import { expectNoSeriousA11y } from './support/a11y.ts';
import { setupMediaUploadMock } from './support/media-upload-mock.ts';

async function openMedia(page: Page) {
  await mockLogin(page);
  await page.goto('/admin/media');
  await page.getByRole('button', { name: /^Fotografije\s*0$/ }).click();
  await expect(page.getByRole('button', { name: /Upload u/ })).toBeEnabled();
}

async function selectFiles(page: Page, files: { name: string; mimeType: string }[]) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /Upload u/ }).click();
  await (await chooser).setFiles(files.map(({ name, mimeType }) => ({ name, mimeType, buffer: Buffer.from('synthetic') })));
}
const image = (name: string) => ({ name, mimeType: 'image/jpeg' });

test('izbor tokom aktivnog POST-a čeka red i svaki zadržava svoju mapu', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdUploads: [1] });
  await openMedia(page);
  await selectFiles(page, [image('first.jpg')]);
  await expect.poll(() => mock.posts.length).toBe(1);
  await page.getByRole('button', { name: /^Arhiva\s*0$/ }).click();
  await expect(page.getByRole('button', { name: /Upload u/ })).toBeEnabled();
  await selectFiles(page, [image('second.jpg')]);
  await expect(page.getByRole('progressbar', { name: 'Napredak uploada' })).toHaveAttribute('aria-valuemax', '2');
  expect(mock.posts).toEqual([{ name: 'first.jpg', folder: 'folder-a' }]);
  await expectNoSeriousA11y(page, 'aktivni medijski red');
  mock.releaseUpload(1);
  await expect.poll(() => mock.posts.length).toBe(2);
  await expect(page.getByRole('status')).toContainText('2/2 uspješno');
  expect(mock.posts).toEqual([
    { name: 'first.jpg', folder: 'folder-a' }, { name: 'second.jpg', folder: 'folder-b' },
  ]);
});

test('novi izbor tokom odgođenog GET-a ne nestaje niti čeka zastarjeli odgovor', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdRefresh: true });
  await openMedia(page);
  await selectFiles(page, [image('first.jpg')]);
  await expect.poll(() => mock.heldRefresh()).toBe(true);
  await expect(page.getByRole('status')).toContainText('Osvježavanje biblioteke');
  await selectFiles(page, [image('second.jpg')]);
  await expect.poll(() => mock.posts.length).toBe(2);
  await expect(page.getByRole('status')).toContainText('2/2 uspješno');
  mock.releaseRefresh();
  expect(mock.posts.map((post) => post.name)).toEqual(['first.jpg', 'second.jpg']);
});

test('stari završetak ne briše novi aktivni red ni nakon četiri sekunde', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdUploads: [2] });
  await openMedia(page);
  await selectFiles(page, [image('first.jpg')]);
  await expect(page.getByRole('status')).toContainText('1/1 uspješno');
  await selectFiles(page, [image('second.jpg')]);
  await expect.poll(() => mock.posts.length).toBe(2);
  await page.waitForTimeout(4_300);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await selectFiles(page, [image('third.jpg')]);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '3');
  mock.releaseUpload(2);
  await expect.poll(() => mock.posts.length).toBe(3);
  await expect(page.getByRole('status')).toContainText('3/3 uspješno');
  await page.getByRole('button', { name: 'Zatvori izvještaj' }).click();
  await expect(page.getByText('Upload završen:', { exact: false })).toHaveCount(0);
});

test('greške i odbijeni fajlovi su vidljivi; preostale slike se obrađuju bez retryja', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { failUploads: { 1: 500 } });
  await openMedia(page);
  await selectFiles(page, [image('failed.jpg'), image('ok.jpg')]);
  await expect(page.getByRole('status')).toContainText('1/2 uspješno, 1 neuspješno');
  await expect(page.getByRole('alert')).toContainText('failed.jpg');
  await expect(page.getByRole('alert')).toContainText('ishod nije potvrđen');
  await expectNoSeriousA11y(page, 'greška medijskog uploada');
  await selectFiles(page, [{ name: 'notes.txt', mimeType: 'text/plain' }]);
  await expect(page.getByRole('alert').filter({ hasText: 'notes.txt' })).toContainText('nije slika');
  expect(mock.posts.map((post) => post.name)).toEqual(['failed.jpg', 'ok.jpg']);
});

test('neuspjelo osvježavanje prijavljuje i ručna provjera ne ponavlja POST', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { failAssetReads: 2 });
  await openMedia(page);
  await selectFiles(page, [image('one.jpg')]);
  await expect(page.getByRole('alert')).toContainText('Osvježavanje biblioteke nije potvrđeno');
  const reads = mock.reads();
  await page.getByRole('button', { name: 'Osvježi biblioteku' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect.poll(() => mock.reads()).toBeGreaterThan(reads);
  expect(mock.posts).toEqual([{ name: 'one.jpg', folder: 'folder-a' }]);
});

test('ni zajednički auth interceptor ne ponavlja upload POST nakon 401', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { failUploads: { 1: 401 } });
  await openMedia(page);
  await selectFiles(page, [image('unauthorized.jpg')]);
  await expect(page.getByRole('status')).toContainText('0/1 uspješno, 1 neuspješno');
  await expect(page.getByRole('alert')).toContainText('unauthorized.jpg');
  expect(mock.posts).toEqual([{ name: 'unauthorized.jpg', folder: 'folder-a' }]);
});

test('SPA navigacija i povratak zadržavaju red i ne pokreću drugi worker', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdUploads: [1] });
  await openMedia(page);
  await selectFiles(page, [image('first.jpg'), image('second.jpg')]);
  await expect.poll(() => mock.posts.length).toBe(1);
  await page.getByRole('link', { name: 'Vijesti', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/news/);
  await page.goBack();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '2');
  mock.releaseUpload(1);
  await expect(page.getByRole('status')).toContainText('2/2 uspješno');
  expect(mock.posts.map((post) => post.name)).toEqual(['first.jpg', 'second.jpg']);
});


test('promjena korisnika ne šalje drugi fajl pod tuđom sesijom', async ({ page }) => {
  const mock = await setupMediaUploadMock(page, { holdUploads: [1] });
  await openMedia(page);
  await selectFiles(page, [image('first.jpg'), image('second.jpg')]);
  await expect.poll(() => mock.posts.length).toBe(1);
  await page.evaluate(() => {
    localStorage.setItem('fk_user', JSON.stringify({ id: 'other-user' }));
    localStorage.setItem('fk_access_token', 'synthetic-other-token');
  });
  mock.releaseUpload(1);
  await expect(page.getByRole('alert').filter({ hasText: 'second.jpg' })).toContainText('nije poslano jer se sesija promijenila');
  expect(mock.posts.map((post) => post.name)).toEqual(['first.jpg']);
});

test('sistemski odabir pamti mapu iz trenutka klika čak i ako se mapa promijeni', async ({ page }) => {
  const mock = await setupMediaUploadMock(page);
  await openMedia(page);
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /Upload u/ }).click();
  const opened = await chooser;
  await page.getByRole('button', { name: /^Arhiva\s*0$/ }).click();
  await opened.setFiles({ name: 'first.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('synthetic') });
  await expect(page.getByRole('status')).toContainText('1/1 uspješno');
  await selectFiles(page, [image('second.jpg')]);
  await expect(page.getByRole('status')).toContainText('2/2 uspješno');
  expect(mock.posts).toEqual([
    { name: 'first.jpg', folder: 'folder-a' }, { name: 'second.jpg', folder: 'folder-b' },
  ]);
});
