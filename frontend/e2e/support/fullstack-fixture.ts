import { test as base, expect } from '@playwright/test';

/** Browser se ne smije spojiti van izolovanog test servera niti poslati plaćanje. */
export const test = base.extend<{ isolated: void }>({
  isolated: [async ({ page, context, baseURL }, use, testInfo) => {
    if (!baseURL) throw new Error('Nedostaje lokalni browser server');
    const origin = new URL(baseURL);
    if (origin.protocol !== 'http:' || origin.hostname !== '127.0.0.1') throw new Error('Test mora koristiti 127.0.0.1');
    const proxy = testInfo.project.use.proxy;
    const proxyPort = Number(process.env.E2E_PROXY_PORT ?? Number(origin.port) + 1);
    if (!proxy || proxy.server !== `http://127.0.0.1:${proxyPort}` || proxy.bypass !== '<-loopback>') {
      throw new Error('Full-stack test mora imati lokalni izolacioni proxy i isključen implicitni loopback bypass');
    }
    const unexpected: string[] = [];
    const errors: string[] = [];
    const allowedPosts = new Set(['/api/v1/auth/login', '/api/v1/auth/logout', '/api/v1/auth/refresh', '/api/v1/public-analytics/visit']);
    page.on('pageerror', (error) => errors.push(error.message));
    // Nema context.route: Chromium presretanje bi pauziralo i svaki JS chunk na reloadu.
    // Mrežni isolation-proxy blokira vanjski origin i zabranjene API metode; ovaj
    // observer i dalje ruši test ako aplikacija pokuša zabranjenu mutaciju/plaćanje.
    context.on('request', (request) => {
      const url = new URL(request.url());
      if (url.origin !== origin.origin) return;
      let path = url.pathname;
      try { path = decodeURIComponent(path).replaceAll('\\', '/').replace(/\/{2,}/g, '/').toLowerCase(); } catch { /* proxy odbija neispravno kodiranje */ }
      if (path.startsWith('/api/v1/payments') ||
        ((path === '/api/v1' || path.startsWith('/api/v1/')) && !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) &&
          !(request.method() === 'POST' && allowedPosts.has(path)))) {
        unexpected.push(`${request.method()} ${path}`);
      }
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
