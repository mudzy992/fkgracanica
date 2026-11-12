import { test, expect } from './support/mock-fixture.ts';

test('tabela prikazuje ligu prije kupa i kada polje isLeague izostane', async ({ page, baseURL }) => {
  await page.route(`${baseURL}/api/v1/cms/pages/home`, (route) => route.fulfill({ json: {
    id: 'home-fixture', slug: 'home', title: 'Naslovna',
    sections: [{ id: 'table', widgetType: 'league-table', enabled: true, config: {} }],
  } }));
  await page.route(`${baseURL}/api/v1/seasons`, (route) => route.fulfill({ json: [{
    id: 'season-fixture', name: 'Sezona', isActive: true,
    competitions: [
      { id: 'cup', competitionId: 'cup', competition: { name: 'Kup test' } },
      { id: 'league', competitionId: 'league', competition: { name: 'Liga test', isLeague: true } },
    ],
  }] }));
  await page.route(`${baseURL}/api/v1/clubs/own`, (route) => route.fulfill({ json: null }));
  await page.route(`${baseURL}/api/v1/statistics/standings?*`, (route) => route.fulfill({ json: [] }));
  await page.goto('/');
  const widget = page.locator('#liga');
  await expect(widget.getByRole('button')).toHaveText(['Liga test · liga', 'Kup test']);
  await expect(widget.getByRole('heading', { name: 'Liga test' })).toBeVisible();
  await widget.getByRole('button', { name: 'Kup test' }).click();
  await expect(widget.getByRole('heading', { name: 'Kup test' })).toBeVisible();
});
