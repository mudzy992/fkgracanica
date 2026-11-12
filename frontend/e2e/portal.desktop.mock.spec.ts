import { test, expect } from './support/mock-fixture.ts';
import { expectNoSeriousA11y, findSeriousA11y } from './support/a11y.ts';

test('axe gate otkriva namjerno nedostajući alt', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FK Gračanica', level: 1 })).toBeVisible();
  await page.evaluate(() => {
    const image = document.createElement('img');
    image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA==';
    document.querySelector('main')?.append(image);
  });
  const violations = await findSeriousA11y(page);
  expect(violations.some((violation) => violation.id === 'image-alt')).toBe(true);
});

test('gost je preusmjeren na prijavu; HTTP i klijentski noindex', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/prijava$/);
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Lozinka', { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expectNoSeriousA11y(page, 'prijava desktop');
  const response = await page.goto('/prijava?ref=browser-test');
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
});

test('mock prijava: greška, admin, paleta i odjava', async ({ page, isolated }) => {
  await page.goto('/prijava');
  await page.getByLabel('Email', { exact: true }).fill('audit@example.test');
  await page.getByLabel('Lozinka', { exact: true }).fill('WrongPass123');
  await page.getByRole('button', { name: 'Prijavi se' }).click();
  await expect(page.getByRole('alert')).toHaveText('Neispravni podaci za prijavu');
  await expectNoSeriousA11y(page, 'prijava greška');
  await page.getByLabel('Lozinka', { exact: true }).fill('MockPass123');
  await page.getByRole('button', { name: 'Prijavi se' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Kontrolna tabla' })).toBeVisible();
  await expectNoSeriousA11y(page, 'admin desktop');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoSeriousA11y(page, 'admin komandna paleta');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Odjava' }).click();
  await expect(page).toHaveURL(/\/prijava$/);
  expect(isolated.calls).toContain('POST /auth/logout');
});

test('mock javne stranice, labele, navigacija i Monri bez plaćanja', async ({ page, isolated }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FK Gračanica', level: 1 })).toBeVisible();
  await expectNoSeriousA11y(page, 'naslovna desktop');
  await expect(page.locator('a[href="/prijava"] button, a[href="/pretraga"] button')).toHaveCount(0);
  await page.goto('/vijesti');
  await expect(page.getByRole('heading', { name: 'Vijesti', level: 1 })).toBeVisible();
  await expectNoSeriousA11y(page, 'vijesti desktop');
  await page.goto('/kontakt');
  for (const name of ['Ime', 'Email', 'Poruka']) await expect(page.getByLabel(name, { exact: true })).toBeVisible();
  await expectNoSeriousA11y(page, 'kontakt desktop');
  const response = await page.goto('/placanje/monri?ref=mock');
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expectNoSeriousA11y(page, 'monri gost desktop');
  expect(isolated.calls.some((call) => call.includes('/payments/'))).toBe(false);
});
