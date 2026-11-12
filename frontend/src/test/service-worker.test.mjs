import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

function serviceWorker(initial) {
  let cached = initial;
  const events = {};
  const fetch = vi.fn();
  const put = vi.fn(async (_request, response) => { cached = response; });
  const caches = { match: vi.fn(async () => cached), open: vi.fn(async () => ({ put })) };
  const self = {
    location: { origin: 'https://site.example' },
    addEventListener: (name, listener) => { events[name] = listener; },
  };
  const code = readFileSync('public/sw.js', 'utf8');
  runInNewContext(code, { self, caches, fetch, URL });
  const request = { method: 'GET', mode: 'cors', url: 'https://site.example/assets/editor.js', headers: new Headers() };
  const dispatch = () => {
    let result;
    events.fetch({ request, respondWith: (promise) => { result = promise; } });
    return result;
  };
  return { dispatch, fetch, put, cached: () => cached };
}

const response = (status) => ({ ok: status >= 200 && status < 300, status, clone() { return response(status); } });

describe('service worker i lazy chunkovi', () => {
  it('postojeći uspješan cache ostaje dostupan bez mreže', async () => {
    const sw = serviceWorker(response(200));
    expect((await sw.dispatch()).status).toBe(200);
    expect(sw.fetch).not.toHaveBeenCalled();
  });

  it('404 se ne sprema; naredni uspješan odgovor se sprema', async () => {
    const sw = serviceWorker();
    sw.fetch.mockResolvedValueOnce(response(404)).mockResolvedValueOnce(response(200));
    expect((await sw.dispatch()).status).toBe(404);
    expect(sw.put).not.toHaveBeenCalled();
    expect((await sw.dispatch()).status).toBe(200);
    await vi.waitFor(() => expect(sw.put).toHaveBeenCalledTimes(1));
    expect(sw.cached().status).toBe(200);
  });

  it('stari neuspjeli cache se ignoriše i zamjenjuje uspješnim odgovorom', async () => {
    const sw = serviceWorker(response(404));
    sw.fetch.mockResolvedValue(response(200));
    expect((await sw.dispatch()).status).toBe(200);
    await vi.waitFor(() => expect(sw.put).toHaveBeenCalledTimes(1));
    expect(sw.cached().status).toBe(200);
  });
});
