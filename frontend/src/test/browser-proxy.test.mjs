import http from 'node:http';
import net from 'node:net';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createBrowserTestServer } from '../../e2e/support/server.mjs';

let backend;
let proxy;
let directory;
let port;

async function listen(server) {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return server.address().port;
}

beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'fk-proxy-test-'));
  writeFileSync(join(directory, 'index.html'), '<html><head></head><body>isolated</body></html>');
  backend = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ path: req.url, method: req.method, body }));
    });
  });
  backend.on('upgrade', (_req, socket) => {
    socket.write('HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n');
    socket.once('data', () => { socket.end('pong'); });
  });
  const backendPort = await listen(backend);
  proxy = createBrowserTestServer({ backendUrl: `http://127.0.0.1:${backendPort}`, distDir: directory });
  port = await listen(proxy);
});

afterAll(async () => {
  for (const server of [proxy, backend]) if (server) await new Promise((resolve) => server.close(resolve));
  if (directory) rmSync(directory, { recursive: true, force: true });
});

describe('browser test proxy isolation', () => {
  it('odbija udaljeni backend, TLS i ugrađene pristupne podatke', () => {
    for (const backendUrl of ['https://example.test', 'http://example.test', 'http://127.0.0.1:3000/path', 'http://user:pass@127.0.0.1:3000']) {
      expect(() => createBrowserTestServer({ backendUrl, distDir: directory })).toThrow();
    }
  });

  it('ograničava testno kašnjenje i odgađa ciljanu sintetičku posjetu', async () => {
    const backendUrl = `http://127.0.0.1:${backend.address().port}`;
    for (const visitDelayMs of [-1, 5001, 1.5, NaN]) {
      expect(() => createBrowserTestServer({ backendUrl, distDir: directory, visitDelayMs })).toThrow();
    }
    const delayed = createBrowserTestServer({ backendUrl, distDir: directory, visitDelayMs: 200 });
    const delayedPort = await listen(delayed);
    try {
      const start = performance.now();
      const response = await fetch(`http://127.0.0.1:${delayedPort}/api/v1/public-analytics/visit`, { method: 'POST', body: 'synthetic' });
      expect(performance.now() - start).toBeGreaterThanOrEqual(150);
      expect(await response.json()).toEqual({ path: '/api/v1/public-analytics/visit', method: 'POST', body: 'synthetic' });
    } finally {
      await new Promise((resolve) => delayed.close(resolve));
    }
  });

  it('prosljeđuje relativni API i čuva HTML/robots handler', async () => {
    const base = `http://127.0.0.1:${port}`;
    const response = await fetch(`${base}/api/v1/auth/login?test=1`, { method: 'POST', body: 'mock-body' });
    expect(await response.json()).toEqual({ path: '/api/v1/auth/login?test=1', method: 'POST', body: 'mock-body' });
    const html = await fetch(`${base}/prijava?test=1`);
    expect(html.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(await html.text()).toContain('isolated');
  });

  it('prosljeđuje lokalni socket.io upgrade i podatke', async () => {
    const result = await new Promise((resolve, reject) => {
      const socket = net.createConnection(port, '127.0.0.1');
      let buffer = '';
      let upgraded = false;
      socket.setTimeout(5000, () => socket.destroy(new Error('upgrade timeout')));
      socket.on('error', reject);
      socket.on('connect', () => socket.write('GET /socket.io/?transport=websocket HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n'));
      socket.on('data', (chunk) => {
        buffer += chunk.toString();
        if (!upgraded && buffer.includes('\r\n\r\n')) {
          upgraded = true;
          socket.write('ping');
        }
        if (upgraded && buffer.includes('pong')) { socket.destroy(); resolve(buffer); }
      });
    });
    expect(result).toContain('101 Switching Protocols');
    expect(result).toContain('pong');
  });
});
