import http from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOgApp } from '../../server/og-server.mjs';
import { createIsolationProxy } from './isolation-proxy.mjs';

/** Browser testovi smiju se povezati samo s lokalnim, izolovanim backendom. */
export function createBrowserTestServer({ backendUrl = 'http://127.0.0.1:3000', distDir } = {}) {
  const backend = new URL(backendUrl);
  if (backend.protocol !== 'http:' || backend.hostname !== '127.0.0.1' || backend.pathname !== '/' || backend.search || backend.hash || backend.username || backend.password) {
    throw new Error('Browser test proxy prihvata samo izolovani HTTP backend na 127.0.0.1');
  }
  const app = createOgApp({ distDir, internalApiUrl: `${backend.origin}/api/v1` });
  const proxyOptions = (req) => ({
    hostname: backend.hostname,
    port: backend.port || 80,
    method: req.method,
    path: req.url,
    headers: { ...req.headers, host: backend.host },
  });

  const server = http.createServer((req, res) => {
    const path = new URL(req.url, 'http://local.test').pathname;
    if (path !== '/api/v1' && !path.startsWith('/api/v1/') && !path.startsWith('/socket.io/')) {
      app(req, res);
      return;
    }
    const upstream = http.request(proxyOptions(req), (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(res);
    });
    upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
    req.pipe(upstream);
  });

  server.on('upgrade', (req, socket, head) => {
    if (!req.url?.startsWith('/socket.io/')) return socket.destroy();
    const upstream = http.request(proxyOptions(req));
    upstream.on('upgrade', (response, remote, remoteHead) => {
      const lines = [`HTTP/${response.httpVersion} ${response.statusCode} ${response.statusMessage}`];
      for (let i = 0; i < response.rawHeaders.length; i += 2) lines.push(`${response.rawHeaders[i]}: ${response.rawHeaders[i + 1]}`);
      socket.write(`${lines.join('\r\n')}\r\n\r\n`);
      if (remoteHead.length) socket.write(remoteHead);
      if (head.length) remote.write(head);
      socket.pipe(remote).pipe(socket);
    });
    upstream.on('response', () => socket.destroy());
    upstream.on('error', () => socket.destroy());
    upstream.end();
  });
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.E2E_PORT ?? 4173);
  const isolationPort = Number(process.env.E2E_PROXY_PORT ?? port + 1);
  if (!Number.isInteger(port) || !Number.isInteger(isolationPort) || port < 1 || isolationPort < 1 ||
    port > 65535 || isolationPort > 65535 || port === isolationPort) throw new Error('Neispravni browser test portovi');
  const server = createBrowserTestServer({ backendUrl: process.env.E2E_BACKEND_URL });
  createIsolationProxy({ origin: `http://127.0.0.1:${port}` }).listen(isolationPort, '127.0.0.1', () => {
    // Playwright provjerava samo app port: ne oglašavati ga prije mrežne granice.
    server.listen(port, '0.0.0.0', () => console.log(`[browser-test-server] :${port}`));
  });
}
