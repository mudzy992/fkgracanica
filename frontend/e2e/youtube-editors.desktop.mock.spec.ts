import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';
import { expectNoSeriousA11y } from './support/a11y.ts';

const legacy = 'https://notyoutube.com/watch?v=abc123XYZ01';

test('editor vijesti odbija lažni link i eksplicitno uklanja stari', async ({ page }) => {
  await page.route('**/api/v1/gallery*', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/v1/players*', (route) => route.fulfill({ json: [] }));
  const writes: Record<string, unknown>[] = [];
  await page.route('**/api/v1/news/fe06-edit', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: {
      id: 'fe06-edit', title: 'Testna vijest', slug: 'testna-vijest', content: '<p>Dovoljno dug sadržaj vijesti.</p>', videoUrl: legacy, tags: [],
    } });
    if (route.request().method() !== 'PATCH') throw new Error('Neočekivana mutacija vijesti');
    writes.push(route.request().postDataJSON() as Record<string, unknown>);
    return route.fulfill({ json: { id: 'fe06-edit' } });
  });
  await mockLogin(page);
  await page.goto('/admin/news/fe06-edit/edit');
  const input = page.getByRole('textbox', { name: 'Video URL' });
  await expect(input).toHaveValue(legacy);
  await input.fill('https://youtu.be/short');
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  const error = page.getByRole('alert');
  await expect(error).toContainText('Unesite ispravan YouTube link');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(writes).toEqual([]);
  await input.fill('');
  await page.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].videoUrl).toBeNull();
});

test('editor audija prijavljuje neispravan link i zadržava mogućnost čišćenja', async ({ page }) => {
  const user = { id: 'settings-user', email: 'audit@example.test', firstName: 'Test', lastName: 'User', permissions: ['settings.read', 'settings.update', 'dashboard.read'] };
  await page.route('**/api/v1/auth/login', (route) => route.fulfill({ json: { user, accessToken: 'mock-access', refreshToken: 'mock-refresh' } }));
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({ json: user }));
  const writes: Record<string, string>[] = [];
  await page.route('**/api/v1/settings/public', async (route) => {
    if (route.request().method() === 'PUT') writes.push(route.request().postDataJSON() as Record<string, string>);
    return route.fulfill({ json: { 'feature.live': 'true', 'live.prematchAudioUrl': legacy, 'club.name': 'FK Gračanica' } });
  });
  await mockLogin(page);
  await page.goto('/admin/settings');
  await page.getByRole('button', { name: 'Live centar', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Pre-match audio (YouTube)' });
  await input.fill('https://youtu.be/short');
  await page.getByRole('button', { name: 'Sačuvaj promjene' }).click();
  await expect(page.getByRole('alert')).toContainText('Unesite ispravan YouTube link');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(writes).toEqual([]);
  await expectNoSeriousA11y(page, 'neispravan prematch audio');
  await input.fill('');
  await page.getByRole('button', { name: 'Sačuvaj promjene' }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0]['live.prematchAudioUrl']).toBe('');
});
