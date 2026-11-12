import { expect, type Page } from '@playwright/test';

export async function mockLogin(page: Page) {
  await page.goto('/prijava');
  await page.getByLabel('Email', { exact: true }).fill('audit@example.test');
  await page.getByLabel('Lozinka', { exact: true }).fill('MockPass123');
  await page.getByRole('button', { name: 'Prijavi se' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Kontrolna tabla' })).toBeVisible();
}
