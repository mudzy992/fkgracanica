import type { Page } from '@playwright/test';
import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';
import { setupLineupMock } from './support/lineup-mock.ts';

async function openEditor(page: Page) {
  await mockLogin(page);
  await page.goto('/admin/seasons/calendar/competitions/edition?roundId=round');
  await page.getByRole('button', { name: 'Postava', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Postava: Domaći test vs Gosti test' });
  await expect(dialog.locator('select')).toHaveCount(11);
  return dialog;
}

test('prazni GK i klupski RW ostaju na svojim mjestima i pri mock spremanju', async ({ page }) => {
  const { requests } = await setupLineupMock(page, 'default');
  const dialog = await openEditor(page);
  await expect(dialog.locator('select').nth(0)).toHaveValue('');
  await expect(dialog.locator('select').nth(10)).toHaveValue('wing');
  await dialog.getByRole('button', { name: 'Sačuvaj obje postave' }).click();
  await expect(dialog).toHaveCount(0);
  expect(requests).toEqual([[{ playerId: 'wing', clubId: 'home', positionX: 75, positionY: 28, isStarter: true }]]);
});

test('4-4-2 čuva klupske linije i stvarne koordinate nakon spremanja', async ({ page }) => {
  const { requests } = await setupLineupMock(page, 'four-four-two');
  const dialog = await openEditor(page);
  await expect(dialog.locator('select').nth(0)).toHaveValue('');
  await expect(dialog.locator('select').nth(8)).toHaveValue('mid');
  await expect(dialog.locator('select').nth(8).locator('option').first()).toHaveText('MID');
  await expect(dialog.locator('select').nth(10)).toHaveValue('wing');
  await dialog.getByRole('button', { name: 'Sačuvaj obje postave' }).click();
  await expect(dialog).toHaveCount(0);
  expect(requests).toEqual([[
    { playerId: 'mid', clubId: 'home', positionX: 88, positionY: 38, isStarter: true },
    { playerId: 'wing', clubId: 'home', positionX: 63, positionY: 14, isStarter: true },
  ]]);
});

test('namjerno prazna postava ne dopunjava se klupskim predloškom ni nakon ponovnog otvaranja', async ({ page }) => {
  const { requests } = await setupLineupMock(page, 'empty');
  let dialog = await openEditor(page);
  await expect(dialog.locator('select').nth(0)).toHaveValue('');
  await expect(dialog.locator('select').nth(10)).toHaveValue('');
  await dialog.getByRole('button', { name: 'Sačuvaj obje postave' }).click();
  await expect(dialog).toHaveCount(0);
  expect(requests).toEqual([[]]);
  await page.getByRole('button', { name: 'Postava', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Postava: Domaći test vs Gosti test' });
  await expect(dialog.locator('select')).toHaveCount(11);
  await expect(dialog.locator('select').nth(10)).toHaveValue('');
});

test('sačuvani bivši igrač i rezerva ostaju vidljivi/očuvani, bez prepisivanja koordinata', async ({ page }) => {
  const { requests } = await setupLineupMock(page, 'saved');
  const dialog = await openEditor(page);
  const formerSelect = dialog.locator('select').nth(8);
  await expect(formerSelect).toHaveValue('former');
  await expect(formerSelect.locator('option:checked')).toHaveText('9 Adi Bivsi');
  await expect(dialog.locator('select').nth(0)).toHaveValue('');
  await dialog.getByRole('button', { name: 'Sačuvaj obje postave' }).click();
  await expect(dialog).toHaveCount(0);
  expect(requests).toEqual([[
    { playerId: 'former', clubId: 'home', positionX: 71, positionY: 25, isStarter: true },
    { playerId: 'reserve', clubId: 'home', isStarter: false },
  ]]);
});

test('javni pre-match odmah prikazuje samo gostujućeg sačuvanog igrača i bez klupske postave', async ({ page }) => {
  await page.clock.install();
  await setupLineupMock(page, 'away');
  await page.goto('/live/lineup-match');
  const section = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Postava — Gosti test' }) });
  await expect(section.getByRole('button', { name: 'G. Gost' })).toBeVisible();
  await page.clock.fastForward(25_000);
  await expect(section.getByRole('button', { name: 'G. Gost' })).toBeVisible();
});

test('javno navodi i dodatne spremljene startere izvan 11 mjesta', async ({ page }) => {
  await setupLineupMock(page, 'overflow');
  await page.goto('/live/lineup-match');
  await expect(page.getByText(/Ostali spremljeni starteri: Test Overflow11/)).toBeVisible();
});

test('javni fallback nakon inicijalizacije kluba vrijedi samo prije prvog spremanja', async ({ page }) => {
  await setupLineupMock(page, 'uninitialized');
  await page.goto('/live/lineup-match');
  await expect(page.getByRole('heading', { name: 'Postava — Domaći test' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'N. Krilo' })).toBeVisible();
});

test('javni prikaz namjerno prazne spremljene postave ne vraća klupske igrače', async ({ page }) => {
  await setupLineupMock(page, 'empty');
  await page.goto('/live/lineup-match');
  await expect(page.getByText('Nema sponzora.')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Postava —/ })).toHaveCount(0);
});


test('nesklad starih klubova prikazuje upozorenje i blokira opasno spremanje', async ({ page }) => {
  const { requests } = await setupLineupMock(page, 'conflict');
  const dialog = await openEditor(page);
  await expect(dialog.getByRole('alert')).toContainText('prethodnog kluba');
  await expect(dialog.getByRole('button', { name: 'Sačuvaj obje postave' })).toBeDisabled();
  expect(requests).toEqual([]);
});

test('konflikt koji API otkrije pri spremanju prikaže grešku i ne zatvara editor', async ({ page }) => {
  const { requests } = await setupLineupMock(page, 'save-conflict');
  const dialog = await openEditor(page);
  await dialog.getByRole('button', { name: 'Sačuvaj obje postave' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Postava je u sukobu s klubovima.');
  await expect(dialog).toBeVisible();
  expect(requests).toHaveLength(1);
});


test('završena retro utakmica s neskladom upućuje na ručni pregled', async ({ page }) => {
  const { requests } = await setupLineupMock(page, 'finished-conflict');
  const dialog = await openEditor(page);
  const warning = dialog.getByRole('alert');
  await expect(warning).toContainText('završena i zaključana');
  await expect(warning).toContainText('ručni pregled');
  await expect(dialog.getByRole('button', { name: 'Sačuvaj obje postave' })).toBeDisabled();
  expect(requests).toEqual([]);
});


test('promjena kluba s postojećom postavom prikazuje API odbijanje u formi', async ({ page }) => {
  const { matchUpdates } = await setupLineupMock(page, 'patch-conflict');
  await mockLogin(page);
  await page.goto('/admin/seasons/calendar/competitions/edition?roundId=round');
  await page.getByRole('cell', { name: 'Uredi Postava Obriši' }).getByRole('button', { name: 'Uredi', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Uredi utakmicu' });
  await dialog.locator('select').nth(0).selectOption('other');
  await dialog.getByRole('button', { name: 'Spremi', exact: true }).click();
  await expect(dialog.getByText('Spremljena postava sadrži redove prethodnog kluba.')).toBeVisible();
  await expect(dialog).toBeVisible();
  expect(matchUpdates).toHaveLength(1);
});

test('povrat odgovarajućeg kluba na nezavršenoj utakmici omogućava uređivanje postave', async ({ page }) => {
  const { matchUpdates } = await setupLineupMock(page, 'restore-club');
  await mockLogin(page);
  await page.goto('/admin/seasons/calendar/competitions/edition?roundId=round');
  await page.getByRole('cell', { name: 'Uredi Postava Obriši' }).getByRole('button', { name: 'Uredi', exact: true }).click();
  const edit = page.getByRole('dialog', { name: 'Uredi utakmicu' });
  await edit.locator('select').nth(0).selectOption('home');
  await edit.getByRole('button', { name: 'Spremi', exact: true }).click();
  await expect(edit).toHaveCount(0);
  expect(matchUpdates).toHaveLength(1);
  await page.getByRole('button', { name: 'Postava', exact: true }).click();
  const lineup = page.getByRole('dialog', { name: 'Postava: Domaći test vs Gosti test' });
  await expect(lineup.locator('select')).toHaveCount(11);
  await expect(lineup.getByRole('alert')).toHaveCount(0);
  await expect(lineup.getByRole('button', { name: 'Sačuvaj obje postave' })).toBeEnabled();
  await expect(lineup.locator('select').nth(8)).toHaveValue('former');
});
