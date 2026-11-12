import { test, expect } from './support/mock-fixture.ts';
import { expectNoSeriousA11y } from './support/a11y.ts';
import { mockLogin } from './support/login.ts';

test('uski web: meni je modalni, upravlja fokusom i navigira', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FK Gračanica', level: 1 })).toBeVisible();
  await expectNoSeriousA11y(page, 'naslovna uski viewport');
  const trigger = page.getByRole('button', { name: 'Otvori meni' });
  await trigger.click();
  const menu = page.getByRole('dialog', { name: 'Meni' });
  await expect(menu).toBeVisible();
  await expect(menu.locator('[data-modal-initial-focus]')).toBeFocused();
  expect(await menu.evaluate((element) => element.matches(':modal'))).toBe(true);
  expect(await page.evaluate(() => {
    document.querySelector<HTMLElement>('header a')?.focus();
    return !!document.activeElement?.closest('dialog');
  })).toBe(true);
  await expectNoSeriousA11y(page, 'mobilni web meni otvoren');
  await page.keyboard.press('Shift+Tab');
  await expect(menu.locator('[data-modal-initial-focus]')).not.toBeFocused();
  await page.keyboard.press('Tab');
  await expect(menu.locator('[data-modal-initial-focus]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(20, 400);
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await menu.getByRole('link', { name: 'Vijesti' }).click();
  await expect(page).toHaveURL(/\/vijesti$/);
  await expect(menu).toHaveCount(0);
});

test('uski web: admin navigacija, notifikacije i medijske mape', async ({ page, isolated }) => {
  await mockLogin(page);
  await page.getByRole('button', { name: 'Notifikacije' }).click();
  const notifications = page.getByRole('dialog', { name: 'Notifikacije' });
  await expect(notifications).toBeVisible();
  await expectNoSeriousA11y(page, 'mobilne notifikacije');
  await notifications.getByRole('link', { name: 'Pogledaj sve' }).click();
  await expect(page).toHaveURL(/\/admin\/notifications$/);
  await expect(notifications).toHaveCount(0);

  await page.goto('/admin');
  await page.getByRole('button', { name: 'Otvori meni' }).click();
  const adminMenu = page.locator('dialog[data-sheet-modal][open]');
  await expectNoSeriousA11y(page, 'mobilni admin meni');
  await adminMenu.getByRole('button', { name: 'Sadržaj' }).click();
  await adminMenu.locator('a[href="/admin/media"]').click();
  await expect(page).toHaveURL(/\/admin\/media$/);
  await expect(adminMenu).toHaveCount(0);

  await page.getByRole('button', { name: /Mapa: Svi mediji/ }).click();
  const folders = page.getByRole('dialog', { name: 'Mape medija' });
  await expect(folders).toBeVisible();
  await expectNoSeriousA11y(page, 'medijske mape');
  const deleteButton = folders.getByRole('button', { name: 'Obriši: Fotografije' });
  await deleteButton.click();
  const confirmation = page.getByRole('dialog', { name: 'Obrisati mapu?' });
  await expect(confirmation).toBeVisible();
  expect(await confirmation.evaluate((element) => element.matches(':modal'))).toBe(true);
  await expectNoSeriousA11y(page, 'potvrda brisanja mape');
  await page.keyboard.press('Escape');
  await expect(confirmation).toHaveCount(0);
  await expect(folders).toBeVisible();
  await expect(deleteButton).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await folders.getByRole('button', { name: /^Fotografije/ }).click();
  await expect(folders).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Mapa: Fotografije/ })).toBeVisible();
  expect(isolated.calls).not.toContain('DELETE /media/folders/folder-1');
});
