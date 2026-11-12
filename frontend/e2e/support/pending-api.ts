import type { Page, Request } from '@playwright/test';

/** Observe all API requests, including failures. Diagnostics never contain headers or queries. */
export function watchPendingApi(page: Page): () => string[] {
  const pending = new Map<Request, number | undefined>();
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/v1/')) pending.set(request, undefined);
  });
  page.on('response', (response) => {
    const request = response.request();
    if (pending.has(request)) pending.set(request, response.status());
  });
  page.on('requestfinished', (request) => pending.delete(request));
  page.on('requestfailed', (request) => pending.delete(request));
  return () =>
    [...pending]
      .map(
        ([request, status]) =>
          `${request.method()} ${new URL(request.url()).pathname} status=${status ?? 'no-headers'}`,
      )
      .sort();
}
