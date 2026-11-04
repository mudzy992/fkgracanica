import { test, expect } from './support/fullstack-fixture.ts';

test('izolovani backend: seedovana naslovna, zaštita, prijava i odjava', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email?.endsWith('@example.test') || !password || password.length < 16) {
    throw new Error('Potrebni su isključivo sintetički ADMIN_EMAIL i privremena ADMIN_PASSWORD');
  }

  const cms = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/v1/cms/pages/home');
  await page.goto('/');
  expect((await cms).ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'FK Gračanica', level: 1 })).toBeVisible();

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/prijava$/);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Lozinka', { exact: true }).fill(`wrong-${password}`);
  const rejected = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/v1/auth/login');
  await page.getByRole('button', { name: 'Prijavi se' }).click();
  expect((await rejected).status()).toBe(401);
  await expect(page.getByRole('alert')).toHaveText('Neispravni podaci za prijavu');

  await page.getByLabel('Lozinka', { exact: true }).fill(password);
  const login = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/v1/auth/login');
  await page.getByRole('button', { name: 'Prijavi se' }).click();
  expect((await login).ok()).toBe(true);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Kontrolna tabla' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('fk_access_token')))).toBe(true);

  const me = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/v1/auth/me');
  await page.reload();
  expect((await me).ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Kontrolna tabla' })).toBeVisible();
  const logout = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/v1/auth/logout');
  await page.getByRole('button', { name: 'Odjava' }).click();
  expect((await logout).ok()).toBe(true);
  await expect(page).toHaveURL(/\/prijava$/);
  expect(await page.evaluate(() => localStorage.getItem('fk_access_token'))).toBeNull();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/prijava$/);
});
