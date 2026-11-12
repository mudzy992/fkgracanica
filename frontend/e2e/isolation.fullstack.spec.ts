import { test, expect } from '@playwright/test';

test('mrežna granica odbija vanjski origin, plaćanja i nedozvoljene mutacije', async ({ page, context }) => {
  await page.goto('/');
  const results = await page.evaluate(async () => {
    const blocked = [
      fetch('/api/v1/payments/__sandbox_probe__'),
      fetch('/api/v1/%70ayments/__sandbox_probe__', { method: 'POST' }),
      fetch('/api/v1/__sandbox_probe__', { method: 'DELETE' }),
    ];
    return Promise.all(blocked.map(async (request) => (await request).status));
  });
  expect(results).toEqual([403, 403, 403]);

  // Direktni pristup izolovanom backend portu ne smije zaobići proxy; ovo je samo health GET.
  const otherPage = await context.newPage();
  const backend = new URL(process.env.E2E_BACKEND_URL ?? 'http://127.0.0.1:3000');
  expect((await otherPage.goto(new URL('/api/v1/health', backend).toString()))?.status()).toBe(403);
  // Ne koristi stvarnu vanjsku domenu; CONNECT mora biti odbijen na lokalnom proxyju.
  await expect(otherPage.goto('https://external.invalid')).rejects.toThrow();
});
