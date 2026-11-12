import { mockLogin } from './support/login.ts';
import { test, expect } from './support/mock-fixture.ts';

test('lazy club hub supports direct URL and reload', async ({ page, baseURL }) => {
  await page.route(`${baseURL}/api/v1/clubs/club-fixture`, (route) => route.fulfill({ json: { id: 'club-fixture', name: 'Klub test' } }));
  await mockLogin(page);
  await page.goto('/admin/clubs/club-fixture');
  await expect(page.getByRole('heading', { name: 'Klub test' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Klub test' })).toBeVisible();
});

for (const path of ['/admin/seasons/calendar-fixture/competitions/edition-fixture', '/admin/competitions/seasons/edition-fixture']) {
  test(`lazy season hub supports direct URL and reload: ${path}`, async ({ page, baseURL }) => {
    await page.route(`${baseURL}/api/v1/seasons`, (route) => route.fulfill({ json: [
      { id: 'calendar-fixture', name: 'Sezona test', competitions: [
        { id: 'edition-fixture', competitionId: 'competition-fixture', competition: { name: 'Liga test' } },
      ] },
    ] }));
    await page.route(`${baseURL}/api/v1/rounds?*`, (route) => route.fulfill({ json: [] }));
    await mockLogin(page);
    await page.goto(path);
    await expect(page.getByRole('heading', { name: /Liga test/ })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: /Liga test/ })).toBeVisible();
  });
}

test('lazy membership hub supports direct URL and reload with permission', async ({ page, baseURL }) => {
  const user = {
    id: '1', email: 'test@example.invalid', displayName: 'Test Admin',
    permissions: ['dashboard.read', 'membership.manage'], roles: ['admin'],
  };
  await page.route(`${baseURL}/api/v1/auth/login`, (route) => route.fulfill({ json: { accessToken: 'mock-token', refreshToken: 'mock-refresh', user } }));
  await page.route(`${baseURL}/api/v1/auth/me`, (route) => route.fulfill({ json: user }));
  await page.route(`${baseURL}/api/v1/membership`, (route) => route.fulfill({ json: [] }));
  await page.route(`${baseURL}/api/v1/gallery`, (route) => route.fulfill({ json: [] }));
  await mockLogin(page);
  await page.goto('/admin/membership');
  await expect(page.getByRole('heading', { name: 'Članstvo', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Članstvo', exact: true })).toBeVisible();
});


test('lazy gallery editor supports an existing album direct URL and reload', async ({ page, baseURL }) => {
  await page.route(`${baseURL}/api/v1/gallery`, (route) => route.fulfill({ json: [] }));
  await page.route(`${baseURL}/api/v1/gallery/gallery-fixture`, (route) => route.fulfill({ json: {
    id: 'gallery-fixture', title: 'Probni album', photos: [],
  } }));
  await mockLogin(page);
  await page.goto('/admin/gallery/gallery-fixture/edit');
  await expect(page.getByRole('heading', { name: 'Uredi galeriju' })).toBeVisible();
  await expect(page.locator('input[value="Probni album"]')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Uredi galeriju' })).toBeVisible();
  await expect(page.locator('input[value="Probni album"]')).toBeVisible();
});
