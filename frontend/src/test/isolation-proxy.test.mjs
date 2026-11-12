import http from 'node:http';
import net from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createIsolationProxy } from '../../e2e/support/isolation-proxy.mjs';

let upstream;
let isolation;
let other;
let origin;
let proxyPort;
let otherPort;
const requests = [];
let otherHits = 0;
let upgrades = 0;

async function listen(server) {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return server.address().port;
}

beforeAll(async () => {
  upstream = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      requests.push({ url: req.url, method: req.method, body, proxyAuth: req.headers['proxy-authorization'] });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ url: req.url, method: req.method, body }));
    });
  });
  upstream.on('upgrade', (_req, socket) => {
    upgrades++;
    socket.write('HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n');
    socket.once('data', () => socket.end('pong'));
  });
  other = http.createServer((_req, res) => { otherHits++; res.end('must not reach'); });
  origin = `http://127.0.0.1:${await listen(upstream)}`;
  otherPort = await listen(other);
  isolation = createIsolationProxy({ origin });
  proxyPort = await listen(isolation);
});

afterAll(async () => {
  for (const server of [isolation, upstream, other]) if (server) await new Promise((resolve) => server.close(resolve));
});
beforeEach(() => { requests.length = 0; otherHits = 0; upgrades = 0; });

function throughProxy(target, method = 'GET', body = '', headers = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request({ host: '127.0.0.1', port: proxyPort, path: target, method, headers }, (response) => {
      let output = '';
      response.on('data', (chunk) => { output += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body: output }));
    });
    request.on('error', reject);
    request.end(body);
  });
}

describe('mrežna granica browser testa', () => {
  it('ne prihvata udaljeni origin, TLS, putanju ili ugrađene pristupne podatke', () => {
    for (const bad of ['https://127.0.0.1:4173', 'http://example.test', 'http://127.0.0.1:4173/path', 'http://u:p@127.0.0.1:4173']) {
      expect(() => createIsolationProxy({ origin: bad })).toThrow();
    }
  });

  it('propušta samo odobreni origin i dozvoljene POST zahtjeve uz query i body', async () => {
    const response = await throughProxy(`${origin}/api/v1/auth/login?fixture=1`, 'POST', 'synthetic', { 'proxy-authorization': 'test-only' });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ url: '/api/v1/auth/login?fixture=1', method: 'POST', body: 'synthetic' });
    expect(requests).toEqual([{ url: '/api/v1/auth/login?fixture=1', method: 'POST', body: 'synthetic', proxyAuth: undefined }]);
    expect((await throughProxy(`${origin}/assets/app.js`)).status).toBe(200);
  });

  it('blokira druge origine, plaćanja i neodobrene mutacije prije upstreama', async () => {
    for (const [target, method] of [
      [`http://127.0.0.1:${otherPort}/api/v1/health`, 'GET'],
      ['http://example.test/', 'GET'],
      [`${origin}/api/v1/payments`, 'GET'],
      [`${origin}/api/v1/%70ayments/anything`, 'POST'],
      [`${origin}/api/v1%2Fpayments/anything`, 'GET'],
      [`${origin}/api/v1//payments/anything`, 'GET'],
      [`${origin}/api/v1/%2570ayments/anything`, 'GET'],
      [`${origin}/api/v1/users`, 'DELETE'],
      [`${origin}/api/v1/unknown`, 'POST'],
      [`${origin.replace('http://', 'http://user:pass@')}/`, 'GET'],
      ['/relative-path', 'GET'],
    ]) expect((await throughProxy(target, method)).status).toBe(403);
    expect(requests).toEqual([]);
    expect(otherHits).toBe(0);
  });

  it('odbija CONNECT tunel bez kontaktiranja udaljene mreže', async () => {
    const result = await new Promise((resolve, reject) => {
      const socket = net.createConnection(proxyPort, '127.0.0.1');
      let output = '';
      socket.setTimeout(5000, () => socket.destroy(new Error('CONNECT timeout')));
      socket.on('error', reject);
      socket.on('connect', () => socket.write('CONNECT 203.0.113.1:443 HTTP/1.1\r\nHost: 203.0.113.1:443\r\n\r\n'));
      socket.on('data', (chunk) => { output += chunk.toString(); });
      socket.on('end', () => resolve(output));
    });
    expect(result).toContain('403 Forbidden');
    expect(requests).toEqual([]);
  });

  it('odbija upgrade za drugi origin ili drugi lokalni path', async () => {
    for (const target of [`http://127.0.0.1:${otherPort}/socket.io/`, `${origin}/other`]) {
      const result = await new Promise((resolve, reject) => {
        const socket = net.createConnection(proxyPort, '127.0.0.1');
        let output = '';
        socket.setTimeout(5000, () => socket.destroy(new Error('rejected upgrade timeout')));
        socket.on('error', reject);
        socket.on('connect', () => socket.write(`GET ${target} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n`));
        socket.on('data', (chunk) => { output += chunk.toString(); });
        socket.on('close', () => resolve(output));
      });
      expect(result).not.toContain('101 Switching Protocols');
    }
    expect(upgrades).toBe(0);
    expect(otherHits).toBe(0);
  });

  it('propušta samo lokalni socket.io upgrade', async () => {
    const result = await new Promise((resolve, reject) => {
      const socket = net.createConnection(proxyPort, '127.0.0.1');
      let output = '';
      let upgraded = false;
      socket.setTimeout(5000, () => socket.destroy(new Error('upgrade timeout')));
      socket.on('error', reject);
      socket.on('connect', () => socket.write(`GET ${origin}/socket.io/?transport=websocket HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n`));
      socket.on('data', (chunk) => {
        output += chunk.toString();
        if (!upgraded && output.includes('\r\n\r\n')) { upgraded = true; socket.write('ping'); }
        if (upgraded && output.includes('pong')) { socket.destroy(); resolve(output); }
      });
    });
    expect(result).toContain('101 Switching Protocols');
    expect(result).toContain('pong');
    expect(upgrades).toBe(1);
  });
});
