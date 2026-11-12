import type { Page, Route } from '@playwright/test';
import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';
import { expectNoSeriousA11y } from './support/a11y.ts';

interface ResponseStep { status?: number; body: object; delay?: number }

async function paymentMock(page: Page, baseURL: string, steps: ResponseStep[]) {
  const calls: { path: string; body: { sessionId: string; provider?: string; returnUrl?: string } }[] = [];
  await page.route(`${baseURL}/api/v1/gallery*`, (route) => route.fulfill({ json: [] }));
  await page.route(`${baseURL}/api/v1/public/next-home-match`, (route) => route.fulfill({ json: null }));
  await page.route(`${baseURL}/api/v1/membership/me`, (route) => route.fulfill({ json: [] }));
  await page.route(`${baseURL}/api/v1/ticketing/config`, (route) => route.fulfill({ json: {
    modulesTicketing: true, modulesMembership: true, seasonPassAvailable: true,
    salesModes: { online: true, boxOffice: true },
  } }));
  await page.route(`${baseURL}/api/v1/ticketing/orders`, (route) => route.fulfill({ json: [] }));
  await page.route(`${baseURL}/api/v1/ticketing/season-pass/me`, (route) => route.fulfill({ json: {
    offer: { available: true, label: 'Sezonska', price: 50, season: { name: '2026' }, salesModes: { online: false } },
    pass: { id: 'pass-fixture', status: 'ACTIVE', label: 'Sezonska', price: '50', qrCode: 'test-qr', season: { name: '2026' } },
  } }));
  await page.route(`${baseURL}/api/v1/payments/*/confirm-session`, async (route: Route) => {
    calls.push({ path: new URL(route.request().url()).pathname, body: route.request().postDataJSON() });
    const step = steps[calls.length - 1];
    if (!step) return route.fulfill({ status: 500, json: { message: 'Unexpected confirmation' } });
    if (step.delay) await new Promise((resolve) => setTimeout(resolve, step.delay));
    return route.fulfill({ status: step.status ?? 200, json: step.body });
  });
  return calls;
}

async function trustedMarkerCount(page: Page) {
  return page.evaluate(() => Object.keys(sessionStorage).filter((key) => key.startsWith('fk_confirm_v2:')).length);
}
const pending = { body: { orderId: 'order-fixture', status: 'pending', paymentStatus: 'unpaid' } };
const paid = { body: { orderId: 'order-fixture', status: 'paid' } };

test('ulaznice: stari marker se ignoriše, pending preživi reload, ručni retry potvrđuje', async ({ page, baseURL }) => {
  const calls = await paymentMock(page, baseURL!, [pending, pending, paid]);
  await mockLogin(page);
  await page.evaluate(() => sessionStorage.setItem('fk_confirm_tickets:synthetic-ticket', '1'));
  await page.goto('/ulaznice?paid=1&session_id=synthetic-ticket&provider=stripe');
  await expect(page.getByText('Status uplate još nije potvrđen.', { exact: false })).toBeVisible();
  expect(calls).toHaveLength(1);
  expect(await trustedMarkerCount(page)).toBe(0);
  await expect(page).toHaveURL(/paid=1/);
  await expectNoSeriousA11y(page, 'nepotvrđeni povrat ulaznica');

  await page.reload();
  await expect(page.getByText('Status uplate još nije potvrđen.', { exact: false })).toBeVisible();
  expect(calls).toHaveLength(2);
  await page.getByRole('button', { name: 'Ponovo potvrdi postojeću uplatu' }).click();
  await expect.poll(() => calls.length).toBe(3);
  await expect(page).not.toHaveURL(/paid=1/);
  expect(await trustedMarkerCount(page)).toBe(1);
  expect(calls.every((call) => call.body.sessionId === 'synthetic-ticket' && call.body.provider === 'stripe')).toBe(true);
  expect(calls[2].body.returnUrl).toContain('session_id=synthetic-ticket');
});

test('ulaznice: 503 je neutralno prikazan i retry ne pokreće novi checkout', async ({ page, baseURL }) => {
  const calls = await paymentMock(page, baseURL!, [
    { status: 503, body: { message: 'Synthetic error' } }, paid,
  ]);
  await mockLogin(page);
  await page.goto('/ulaznice?paid=1&session_id=synthetic-error&provider=paypal');
  await expect(page.getByText('Status uplate trenutno nije moguće potvrditi.', { exact: false })).toBeVisible();
  await expect(page.getByText('Ponovna potvrda može dovršiti već odobrenu uplatu', { exact: false })).toBeVisible();
  expect(await trustedMarkerCount(page)).toBe(0);
  await expect(page).toHaveURL(/paid=1/);
  await page.getByRole('button', { name: 'Ponovo potvrdi postojeću uplatu' }).click();
  await expect(page).not.toHaveURL(/paid=1/);
  expect(calls).toHaveLength(2);
  expect(calls.map((call) => call.path)).toEqual([
    '/api/v1/payments/tickets/confirm-session', '/api/v1/payments/tickets/confirm-session',
  ]);
  expect(calls[1].body.provider).toBe('paypal');
});

test('sezonska karta: odgođeni ACTIVE završava potvrdu umjesto beskonačnog skeletona', async ({ page, baseURL }) => {
  const calls = await paymentMock(page, baseURL!, [{ body: { passId: 'pass-fixture', status: 'ACTIVE' }, delay: 400 }]);
  await mockLogin(page);
  await page.goto('/ulaznice?paid=1&session_id=synthetic-season&provider=stripe&kind=season');
  await expect(page).not.toHaveURL(/paid=1/);
  await expect(page.getByText('Sezonska', { exact: false }).first()).toBeVisible();
  expect(calls).toHaveLength(1);
  expect(calls[0].path).toBe('/api/v1/payments/season-pass/confirm-session');
  expect(await trustedMarkerCount(page)).toBe(1);
});

test('članstvo: pending se ne markira, ručna potvrda ACTIVE uklanja samo payment parametre', async ({ page, baseURL }) => {
  const calls = await paymentMock(page, baseURL!, [
    { body: { membershipId: 'membership-fixture', status: 'PENDING' } },
    { body: { membershipId: 'membership-fixture', status: 'ACTIVE' } },
  ]);
  await mockLogin(page);
  await page.goto('/clanstvo?paid=1&session_id=synthetic-member&provider=monri&view=test');
  await expect(page.getByText('Status uplate još nije potvrđen.', { exact: false })).toBeVisible();
  expect(await trustedMarkerCount(page)).toBe(0);
  await page.getByRole('button', { name: 'Ponovo potvrdi postojeću uplatu' }).click();
  await expect(page).toHaveURL(/\/clanstvo\?view=test$/);
  expect(calls).toHaveLength(2);
  expect(calls.every((call) => call.path === '/api/v1/payments/membership/confirm-session')).toBe(true);
});

for (const [path, name] of [['ulaznice', 'Prijavite se'], ['clanstvo', 'Prijavi se']] as const) {
  test(`gost: prijava čuva ${path} povrat i ne potvrđuje prije prijave`, async ({ page, baseURL }) => {
    const calls = await paymentMock(page, baseURL!, [pending]);
    await page.goto(`/${path}?paid=1&session_id=synthetic-guest&provider=stripe`);
    await expect(page.getByText('Prijavite se kako biste potvrdili postojeću uplatu.')).toBeVisible();
    expect(calls).toHaveLength(0);
    await page.locator('main').getByRole('link', { name, exact: true }).click();
    await page.getByLabel('Email', { exact: true }).fill('audit@example.test');
    await page.getByLabel('Lozinka', { exact: true }).fill('MockPass123');
    await page.getByRole('button', { name: 'Prijavi se' }).click();
    await expect(page).toHaveURL(new RegExp(`/${path}\\?paid=1&session_id=synthetic-guest&provider=stripe`));
    await expect(page.getByText('Status uplate još nije potvrđen.', { exact: false })).toBeVisible();
    expect(calls).toHaveLength(1);
  });
}
