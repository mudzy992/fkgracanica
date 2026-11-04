import { test as base, expect } from '@playwright/test';

/** Browser se ne smije spojiti van izolovanog test servera niti poslati plaćanje. */
export const test = base.extend<{ isolated: void }>({
  isolated: [async ({ page, context, baseURL }, use) => {
    if (!baseURL) throw new Error('Nedostaje lokalni browser server');
    const origin = new URL(baseURL);
    if (origin.protocol !== 'http:' || origin.hostname !== '127.0.0.1') throw new Error('Test mora koristiti 127.0.0.1');
    const unexpected: string[] = [];
    const errors: string[] = [];
    const allowedPosts = new Set(['/api/v1/auth/login', '/api/v1/auth/logout', '/api/v1/auth/refresh', '/api/v1/public-analytics/visit']);
    page.on('pageerror', (error) => errors.push(error.message));
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin.origin) return route.abort();
      if (url.pathname.startsWith('/api/v1/payments')) {
        unexpected.push(`${request.method()} ${url.pathname}`);
        return route.abort();
      }
      if (url.pathname.startsWith('/api/v1') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) &&
        !(request.method() === 'POST' && allowedPosts.has(url.pathname))) {
        unexpected.push(`${request.method()} ${url.pathname}`);
        return route.abort();
      }
      return route.continue();
    });
    await context.routeWebSocket('**/*', (socket) => {
      const url = new URL(socket.url());
      if (url.protocol === 'ws:' && url.host === origin.host && url.pathname.startsWith('/socket.io/')) socket.connectToServer();
      else void socket.close();
    });
    await use();
    expect(unexpected, 'Zabranjena mutacija ili plaćanje').toEqual([]);
    expect(errors, 'Neobrađena browser greška').toEqual([]);
  }, { auto: true }],
});
export { expect };
