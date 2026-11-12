import { EventEmitter } from 'node:events';
import type { Page, Request } from '@playwright/test';
import { describe, expect, it } from 'vitest';
import { watchPendingApi } from '../../e2e/support/pending-api';

describe('full-stack pending API observer', () => {
  it('čeka završetak ili grešku i u dijagnostici ne otkriva query ili zaglavlja', () => {
    const page = new EventEmitter();
    const pending = watchPendingApi(page as unknown as Page);
    const request = {
      url: () => 'http://127.0.0.1/api/v1/dashboard/kpis?synthetic=private',
      method: () => 'GET',
    } as Request;
    const asset = { url: () => 'http://127.0.0.1/assets/index.js', method: () => 'GET' } as Request;
    page.emit('request', request);
    page.emit('request', asset);
    expect(pending()).toEqual(['GET /api/v1/dashboard/kpis status=no-headers']);
    page.emit('response', { request: () => request, status: () => 200 });
    expect(pending()).toEqual(['GET /api/v1/dashboard/kpis status=200']);
    page.emit('requestfinished', request);
    expect(pending()).toEqual([]);
    page.emit('request', request);
    page.emit('requestfailed', request);
    expect(pending()).toEqual([]);
  });
});
