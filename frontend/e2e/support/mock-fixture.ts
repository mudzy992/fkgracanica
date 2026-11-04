import { test as base, expect, type Route } from '@playwright/test';

interface MockState { calls: string[]; unexpected: string[]; blocked: string[] }
const user = {
  id: 'mock-user', email: 'audit@example.test', firstName: 'Test', lastName: 'User',
  permissions: ['settings.read', 'dashboard.read', 'news.read', 'media.read', 'media.manage', 'media.upload'],
};

async function respond(route: Route, state: MockState) {
  const req = route.request();
  const path = new URL(req.url()).pathname.replace(/^\/api\/v1/, '');
  const key = `${req.method()} ${path}`;
  state.calls.push(key);
  let status = 200;
  let body: unknown = {};
  switch (key) {
    case 'GET /settings/module-flags': body = { 'feature.showcaseMode': 'false', 'modules.media': 'true' }; break;
    case 'GET /settings/public': body = { 'club.name': 'FK Gračanica', 'seo.robotsIndex': 'true', 'modules.media': 'true' }; break;
    case 'GET /settings/private': body = { 'modules.media': 'true' }; break;
    case 'GET /cms/pages/home':
      body = { id: 'home', slug: 'home', title: 'Naslovna', sections: [{ id: 'hero', widgetType: 'hero', enabled: true, config: { title: 'FK Gračanica', subtitle: 'Ponos grada', buttons: [] } }] };
      break;
    case 'GET /cms/pages/site': body = { id: 'site', sections: [] }; break;
    case 'GET /cms/menus/main': body = { items: [] }; break;
    case 'POST /auth/login': {
      const input = req.postDataJSON() as { password?: string };
      if (input.password === 'MockPass123') body = { user, accessToken: 'mock-access', refreshToken: 'mock-refresh' };
      else { status = 401; body = { message: 'Unauthorized' }; }
      break;
    }
    case 'GET /auth/me': body = user; break;
    case 'POST /auth/logout': body = { ok: true }; break;
    case 'GET /notifications': body = { data: [], meta: { total: 0 } }; break;
    case 'GET /dashboard/kpis': case 'GET /platform-status': body = {}; break;
    case 'GET /media/folders': body = [{ id: 'folder-1', name: 'Fotografije', parentId: null, _count: { assets: 0 } }]; break;
    case 'GET /media/assets': body = { data: [], meta: { total: 0, page: 1, totalPages: 1, limit: 20 } }; break;
    case 'DELETE /media/folders/folder-1': body = { ok: true }; break;
    case 'GET /news-categories': case 'GET /news/published': case 'GET /matches': body = []; break;
    case 'GET /public/app-releases/android/latest': status = 404; body = { message: 'No test release' }; break;
    case 'POST /public-analytics/visit': body = { ok: true }; break;
    default: state.unexpected.push(key); status = 501; body = { message: 'Unexpected isolated mock request' };
  }
  await route.fulfill({ status, json: body });
}

export const test = base.extend<{ isolated: MockState; pageErrors: string[] }>({
  isolated: [async ({ context, baseURL }, use) => {
    if (!baseURL) throw new Error('Missing isolated browser base URL');
    const origin = new URL(baseURL).origin;
    const state: MockState = { calls: [], unexpected: [], blocked: [] };
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) {
        state.blocked.push(url.origin);
        return route.abort();
      }
      if (url.pathname === '/api/v1' || url.pathname.startsWith('/api/v1/')) return respond(route, state);
      return route.continue();
    });
    await context.routeWebSocket('**/*', (socket) => socket.close());
    await use(state);
    expect(state.unexpected, 'Nepredviđen API poziv u izolovanom mocku').toEqual([]);
  }, { auto: true }],
  pageErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await use(errors);
    expect(errors, 'Nehvatane browser greške').toEqual([]);
  }, { auto: true }],
});
export { expect };
