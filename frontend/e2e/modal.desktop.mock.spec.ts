import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';
import { expectNoSeriousA11y } from './support/a11y.ts';

test('samostalne desktop notifikacije zaista su modalne i čuvaju navigaciju', async ({ page }) => {
  await mockLogin(page);
  const trigger = page.getByRole('button', { name: 'Notifikacije' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Notifikacije' });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => element.matches(':modal'))).toBe(true);
  await expect(dialog.locator('[data-modal-initial-focus]')).toBeFocused();
  expect(await page.evaluate(() => {
    document.querySelector<HTMLElement>('aside a[href="/admin"]')?.focus();
    return !!document.activeElement?.closest('dialog');
  })).toBe(true);
  await expectNoSeriousA11y(page, 'samostalne desktop notifikacije');
  await page.keyboard.press('Control+k');
  const nestedPalette = page.getByRole('dialog', { name: 'Pretraga admina' });
  await expect(nestedPalette).toBeVisible();
  expect(await nestedPalette.evaluate((element) => element.matches(':modal'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(nestedPalette).toHaveCount(0);
  await expect(dialog.locator('[data-modal-initial-focus]')).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link', { name: 'Pogledaj sve' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.locator('[data-modal-initial-focus]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.locator('button[tabindex="-1"]').click({ position: { x: 5, y: 5 } });
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole('link', { name: 'Pogledaj sve' }).click();
  await expect(page).toHaveURL(/\/admin\/notifications$/);
  await expect(dialog).toHaveCount(0);
});

test('komandna paleta: fokus, prečice, pretraga i navigacija', async ({ page }) => {
  await mockLogin(page);
  const trigger = page.getByRole('button', { name: 'Traži stranicu ili akciju…' });
  await trigger.focus();
  await page.keyboard.press('Control+k');
  const palette = page.getByRole('dialog', { name: 'Pretraga admina' });
  const input = palette.getByRole('combobox', { name: 'Pretraga admina' });
  await expect(palette).toBeVisible();
  expect(await palette.evaluate((element) => element.matches(':modal'))).toBe(true);
  await expect(input).toBeFocused();
  expect(await page.evaluate(() => {
    document.querySelector<HTMLElement>('aside a[href="/admin"]')?.focus();
    return !!document.activeElement?.closest('dialog');
  })).toBe(true);
  await page.keyboard.press('Tab');
  await expect(input).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(input).toBeFocused();
  await expectNoSeriousA11y(page, 'modalna admin paleta');
  await page.keyboard.press('Escape');
  await expect(palette).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Meta+k');
  await expect(palette).toBeVisible();
  await page.keyboard.press('Meta+k');
  await expect(palette).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await input.fill('mediji');
  await expect(palette.getByRole('option', { name: /Mediji/i }).first()).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/admin\/media$/);
  await expect(palette).toHaveCount(0);
});

test('potvrda u drugom Dialogu zatvara se prva, bez akcije nad narudžbom', async ({ page, isolated }) => {
  const order = { id: 'fake-order-1', status: 'paid', total: 12, user: { email: 'browser@example.test' }, tickets: [] };
  await page.route('**/api/v1/ticketing/admin/orders', (route) => route.fulfill({ json: [order] }));
  await page.route('**/api/v1/ticketing/orders/fake-order-1', (route) => route.fulfill({ json: order }));
  await page.route('**/api/v1/ticketing/config', (route) => route.fulfill({ json: {} }));
  await mockLogin(page);
  await page.goto('/admin/ticketing');
  const details = page.getByRole('button', { name: 'Detalj' });
  await details.click();
  const outer = page.getByRole('dialog', { name: /Narudžba #fake-ord/ });
  await expect(outer).toBeVisible();
  expect(await outer.evaluate((element) => element.matches(':modal'))).toBe(true);
  const trigger = outer.getByRole('button', { name: 'Otkaži narudžbu' });
  await trigger.click();
  const confirmation = page.getByRole('dialog', { name: 'Otkazati narudžbu?' });
  await expect(confirmation).toBeVisible();
  expect(await confirmation.evaluate((element) => element.matches(':modal'))).toBe(true);
  expect(await page.evaluate(() => {
    document.querySelector<HTMLElement>('dialog[open] [data-modal-initial-focus]')?.focus();
    return document.activeElement?.closest('dialog')?.textContent?.includes('Otkazati narudžbu?');
  })).toBe(true);
  await page.keyboard.press('Escape');
  await expect(confirmation).toHaveCount(0);
  await expect(outer).toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(outer).toHaveCount(0);
  await expect(details).toBeFocused();
  expect(isolated.calls.some((call) => call.startsWith('POST /ticketing/'))).toBe(false);
});

test('nespremljena admin forma poštuje odbijenu i prihvaćenu potvrdu', async ({ page, isolated }) => {
  const asset = { id: 'fake-asset', filename: 'test.jpg', originalPath: 'test.jpg', mimeType: 'image/jpeg', size: 1024 };
  await page.route('**/api/v1/media/assets*', (route) => route.fulfill({ json: { data: [asset], meta: { total: 1, page: 1, totalPages: 1, limit: 20 } } }));
  await page.route('**/api/v1/uploads/files/**', (route) => route.fulfill({
    contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64'),
  }));
  await mockLogin(page);
  await page.goto('/admin/media');
  const edit = page.getByRole('button', { name: 'Uredi', exact: true });
  await edit.click();
  const form = page.getByRole('dialog', { name: 'Uredi medij' });
  await expect(form).toBeVisible();
  const filename = form.locator('input').first();
  await expect(filename).toHaveValue('test.jpg');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  await filename.fill('izmijenjeno.jpg');
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => {
    prompts.push(dialog.message());
    if (prompts.length === 1) await dialog.dismiss();
    else await dialog.accept();
  });
  await page.keyboard.press('Escape');
  await expect(form).toBeVisible();
  await expect(filename).toHaveValue('izmijenjeno.jpg');
  expect(prompts).toHaveLength(1);
  await page.keyboard.press('Escape');
  await expect(form).toHaveCount(0);
  expect(prompts).toHaveLength(2);
  await expect(edit).toBeFocused();
  expect(isolated.calls.some((call) => /^(POST|PATCH|DELETE) \/media\//.test(call))).toBe(false);
});


test('preventClose u browseru štiti promijenjene kategorije od Escapea i podloge', async ({ page, isolated }) => {
  await mockLogin(page);
  await page.goto('/admin/news');
  const trigger = page.getByRole('button', { name: 'Kategorije', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Kategorije vijesti' });
  const input = dialog.getByPlaceholder('Naziv nove kategorije');
  await input.fill('Test kategorija');
  await expect(dialog.locator('[data-modal-initial-focus]')).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await dialog.locator('button[tabindex="-1"]').click({ position: { x: 5, y: 5 } });
  await expect(dialog).toBeVisible();
  await expect(input).toHaveValue('Test kategorija');
  await input.clear();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(isolated.calls.some((call) => /^(POST|PATCH|DELETE) \/news/.test(call))).toBe(false);
});
