import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createOgApp } from '../../server/og-server.mjs';

const original = '<html><head><title>Original</title></head><body>app</body></html>';
const protectedPaths = ['/prijava', '/admin/login', '/placanje/monri'];
const agents = ['Mozilla/5.0', 'Googlebot/2.1'];
let server;
let directory = '';
let base = '';
let failShare = false;

beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'fk-og-test-'));
  mkdirSync(join(directory, 'assets'));
  writeFileSync(join(directory, 'index.html'), original);
  writeFileSync(join(directory, 'sw.js'), '/* test worker */');
  writeFileSync(join(directory, 'assets', 'app.js'), '/* test asset */');
  const app = createOgApp({
    distDir: directory,
    internalApiUrl: 'http://isolated.invalid/api/v1',
    fetchImpl: async () => {
      if (failShare) throw new Error('isolated mock failure');
      return new Response(JSON.stringify({
        documentTitle: 'Mock title', title: 'Mock title', description: 'Mock description',
        url: 'https://example.test/', siteName: 'FK test', type: 'website',
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    },
  });
  server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    instance.once('error', reject);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test port');
  base = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  if (server) await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  if (directory) rmSync(directory, { recursive: true, force: true });
});

async function request(path, agent, method = 'GET') {
  return fetch(`${base}${path}`, { method, headers: { 'user-agent': agent }, redirect: 'manual' });
}

describe('og-server HTTP robots policy', () => {
  it.each(agents)('za %s štiti sve tri rute, query i završnu kosu crtu', async (agent) => {
    for (const path of protectedPaths) {
      for (const variant of [path, `${path}?ref=smoke`, `${path}/?ref=smoke`]) {
        const response = await request(variant, agent);
        expect(response.status).toBe(200);
        expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
        expect(response.headers.get('content-type')).toContain('text/html');
      }
    }
  });

  it.each(agents)('za %s podržava HEAD, velika slova i URL encoding', async (agent) => {
    for (const path of ['/PRIJAVA?ref=smoke', '/%70rijava', '/ADMIN/LOGIN', '/PLACANJE/MONRI']) {
      const response = await request(path, agent, 'HEAD');
      expect(response.status).toBe(200);
      expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(await response.text()).toBe('');
    }
  });

  it.each(agents)('za %s ne mijenja javne, slične ni statičke putanje', async (agent) => {
    for (const path of ['/', '/vijesti', '/prijava-extra', '/admin/login-help', '/placanje/monri/detail', '/assets/app.js']) {
      const response = await request(path, agent);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-robots-tag')).toBeNull();
    }
    const worker = await request('/sw.js', agent);
    expect(worker.headers.get('cache-control')).toBe('no-cache');
    expect(worker.headers.get('x-robots-tag')).toBeNull();
  });

  it('zadržava crawler OG obradu i browser originalni HTML', async () => {
    const browser = await request('/vijesti', agents[0]);
    expect(await browser.text()).toBe(original);
    const crawler = await request('/vijesti', agents[1]);
    expect(await crawler.text()).toContain('<meta property="og:title" content="Mock title"');
    expect(crawler.headers.get('cache-control')).toBe('public, max-age=300');
  });

  it('zadržava noindex i kad izolovani crawler API padne', async () => {
    failShare = true;
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const response = await request('/PLACANJE/MONRI/?ref=offline', agents[1]);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(await response.text()).toBe(original);
      expect(log).toHaveBeenCalled();
    } finally {
      failShare = false;
      log.mockRestore();
    }
  });
});
