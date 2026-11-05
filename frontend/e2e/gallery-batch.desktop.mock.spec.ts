import type { Page } from '@playwright/test';
import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';
import { expectNoSeriousA11y } from './support/a11y.ts';
import { setupGalleryBatchMock } from './support/gallery-batch-mock.ts';

async function openGallery(page: Page) {
  await mockLogin(page);
  await page.goto('/admin/gallery/g1/edit');
  await expect(page.getByRole('heading', { name: 'Fotografije (0)' })).toBeVisible();
}

async function selectImages(page: Page, names: string[]) {
  await page.getByRole('button', { name: 'Odaberi slike' }).click();
  const dialog = page.getByRole('dialog', { name: 'Odabir fotografija za galeriju' });
  for (const name of names) await dialog.getByRole('img', { name }).locator('..').click();
  await dialog.getByRole('button', { name: 'Dodaj odabrane' }).click();
}

async function addFolder(page: Page) {
  await page.getByRole('button', { name: 'Dodaj mapu', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Dodaj sve iz mape' });
  await dialog.getByRole('button', { name: /Fotografije/ }).click();
  await dialog.getByRole('button', { name: 'Dodaj mapu', exact: true }).click();
}

test('djelimičan uspjeh osvježava galeriju, čuva nacrt i ručno dodaje samo nedostajuću sliku', async ({ page }) => {
  const mock = await setupGalleryBatchMock(page, { failedPost: 'before-commit' });
  await openGallery(page);
  await page.getByPlaceholder('Naslov albuma *').fill('Nespremljen naslov');
  await page.getByPlaceholder('Opis (opcionalno)').fill('Nespremljen opis');
  await selectImages(page, ['a.jpg', 'b.jpg']);
  await expect(page.getByRole('alert')).toContainText('Neke fotografije možda su već dodane');
  await expect(page.getByRole('heading', { name: 'Fotografije (1)' })).toBeVisible();
  await expect(page.getByPlaceholder('Naslov albuma *')).toHaveValue('Nespremljen naslov');
  await expect(page.getByPlaceholder('Opis (opcionalno)')).toHaveValue('Nespremljen opis');
  expect(mock.writes).toEqual(['originals/a.jpg', 'originals/b.jpg']);
  expect(mock.reads()).toBeGreaterThanOrEqual(2);
  await expectNoSeriousA11y(page, 'djelimično dodane slike');
  await selectImages(page, ['b.jpg']);
  await expect(page.getByRole('heading', { name: 'Fotografije (2)' })).toBeVisible();
  expect(mock.writes).toEqual(['originals/a.jpg', 'originals/b.jpg', 'originals/b.jpg']);
  expect(mock.paths).toEqual(['originals/a.jpg', 'originals/b.jpg']);
});

test('neuspjelo osvježavanje blokira novi unos do ručne uspješne provjere', async ({ page }) => {
  const mock = await setupGalleryBatchMock(page, { failedPost: 'before-commit', failedRefreshes: 2 });
  await openGallery(page);
  await selectImages(page, ['a.jpg', 'b.jpg']);
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('nije moguće osvježiti');
  await expect(page.getByRole('button', { name: 'Odaberi slike' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Dodaj mapu', exact: true })).toBeDisabled();
  const refresh = page.getByRole('button', { name: 'Osvježi galeriju' });
  await refresh.click();
  await expect(alert).toContainText('nije moguće osvježiti');
  await expect(refresh).toBeEnabled();
  expect(mock.writes).toHaveLength(2);
  await refresh.click();
  await expect(page.getByRole('heading', { name: 'Fotografije (1)' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Odaberi slike' })).toBeEnabled();
  expect(mock.writes).toHaveLength(2);
  await selectImages(page, ['b.jpg']);
  await expect(page.getByRole('heading', { name: 'Fotografije (2)' })).toBeVisible();
  expect(mock.paths).toEqual(['originals/a.jpg', 'originals/b.jpg']);
});

test('neizvjestan odgovor nakon mock upisa ne ponavlja već vidljivu putanju', async ({ page }) => {
  const mock = await setupGalleryBatchMock(page, { failedPost: 'after-commit' });
  await openGallery(page);
  await selectImages(page, ['a.jpg', 'b.jpg']);
  await expect(page.getByRole('alert')).toContainText('Neke fotografije možda su već dodane');
  await expect(page.getByRole('heading', { name: 'Fotografije (2)' })).toBeVisible();
  await selectImages(page, []);
  expect(mock.writes).toEqual(['originals/a.jpg', 'originals/b.jpg']);
  expect(mock.paths).toEqual(['originals/a.jpg', 'originals/b.jpg']);
});

test('uvoz mape nakon djelimične greške omogućava ručno dodavanje samo preostale slike', async ({ page }) => {
  const mock = await setupGalleryBatchMock(page, { failedPost: 'before-commit' });
  await openGallery(page);
  await addFolder(page);
  await expect(page.getByRole('alert')).toContainText('Neke fotografije možda su već dodane');
  await expect(page.getByRole('heading', { name: 'Fotografije (1)' })).toBeVisible();
  await addFolder(page);
  await expect(page.getByRole('heading', { name: 'Fotografije (2)' })).toBeVisible();
  expect(mock.writes).toEqual(['originals/a.jpg', 'originals/b.jpg', 'originals/b.jpg']);
  expect(mock.paths).toEqual(['originals/a.jpg', 'originals/b.jpg']);
});

test('greška pri čitanju mape prijavljena je bez slanja fotografija', async ({ page }) => {
  const mock = await setupGalleryBatchMock(page, { failFolderRead: true });
  await openGallery(page);
  await addFolder(page);
  await expect(page.getByRole('alert')).toContainText('Nije moguće učitati slike iz odabrane mape');
  await expect(page.getByRole('button', { name: 'Dodaj mapu', exact: true })).toBeEnabled();
  expect(mock.writes).toEqual([]);
});


test('i nakon uspjeha čeka provjeru prije narednog dodavanja', async ({ page }) => {
  const mock = await setupGalleryBatchMock(page, { failedPost: 'none', holdRefresh: true });
  await openGallery(page);
  await selectImages(page, ['a.jpg', 'b.jpg']);
  await expect(page.getByRole('status')).toContainText('u toku');
  await expect(page.getByRole('button', { name: 'Odaberi slike' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Dodaj mapu', exact: true })).toBeDisabled();
  expect(mock.writes).toEqual(['originals/a.jpg', 'originals/b.jpg']);
  mock.releaseRefresh();
  await expect(page.getByRole('heading', { name: 'Fotografije (2)' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Odaberi slike' })).toBeEnabled();
});


test('oporavak prvog učitavanja galerije ne briše već započeti nacrt', async ({ page }) => {
  const mock = await setupGalleryBatchMock(page, { failedPost: 'none', initialReadFailures: 2 });
  await openGallery(page);
  await page.getByPlaceholder('Naslov albuma *').fill('Nacrt prije oporavka');
  await page.getByPlaceholder('Opis (opcionalno)').fill('Opis prije oporavka');
  await selectImages(page, ['a.jpg']);
  await expect(page.getByRole('heading', { name: 'Fotografije (1)' })).toBeVisible();
  await expect(page.getByPlaceholder('Naslov albuma *')).toHaveValue('Nacrt prije oporavka');
  await expect(page.getByPlaceholder('Opis (opcionalno)')).toHaveValue('Opis prije oporavka');
  expect(mock.writes).toEqual(['originals/a.jpg']);
});
