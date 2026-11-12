import http from 'node:http';

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const ALLOWED_POSTS = new Set([
  '/api/v1/auth/login', '/api/v1/auth/logout', '/api/v1/auth/refresh',
  '/api/v1/public-analytics/visit',
]);

/** HTTP proxy je mrežna granica browser testa, ne produkcijski server. */
export function createIsolationProxy({ origin } = {}) {
  const allowed = new URL(origin);
  if (allowed.protocol !== 'http:' || allowed.hostname !== '127.0.0.1' ||
    allowed.pathname !== '/' || allowed.search || allowed.hash || allowed.username || allowed.password) {
    throw new Error('Browser izolacija dopušta samo testni HTTP origin na 127.0.0.1');
  }

  function targetFor(req, websocket = false) {
    let target;
    let path;
    try {
      target = new URL(req.url);
      path = decodeURIComponent(target.pathname).replaceAll('\\', '/').replace(/\/{2,}/g, '/').toLowerCase();
      if (path.includes('%')) return null;
    } catch {
      return null;
    }
    const protocolAllowed = target.protocol === 'http:' || (websocket && target.protocol === 'ws:');
    if (!protocolAllowed || target.host !== allowed.host || target.username || target.password) return null;
    if (websocket) return req.method === 'GET' && path.startsWith('/socket.io/') ? target : null;
    if (path.startsWith('/api/v1/payments')) return null;
    if (path === '/api/v1' || path.startsWith('/api/v1/')) {
      if (!READ_METHODS.has(req.method) && !(req.method === 'POST' && ALLOWED_POSTS.has(path))) return null;
    }
    return target;
  }

  function options(req, target) {
    const headers = { ...req.headers, host: allowed.host };
    delete headers['proxy-authorization'];
    delete headers['proxy-connection'];
    return {
      hostname: allowed.hostname, port: allowed.port || 80, method: req.method,
      path: target.pathname + target.search, headers,
    };
  }

  const server = http.createServer((req, res) => {
    const target = targetFor(req);
    if (!target) {
      res.writeHead(403, { 'content-type': 'text/plain', 'cache-control': 'no-store' });
      res.end('Blocked by isolated browser test');
      return;
    }
    const upstream = http.request(options(req, target), (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(res);
    });
    upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
    req.on('aborted', () => upstream.destroy());
    req.pipe(upstream);
  });

  // Nikad ne otvarati CONNECT tunel prema vanjskoj mreži, ni prema drugom lokalnom portu.
  server.on('connect', (_req, socket) => socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'));
  server.on('upgrade', (req, socket, head) => {
    const target = targetFor(req, true);
    if (!target) return socket.destroy();
    const upstream = http.request(options(req, target));
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
