import axios, { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, clearTokens, ensureAccessToken, getAccessToken, getRefreshToken, refreshAccessToken, setTokens } from './api';

const originalAdapter = api.defaults.adapter;
const ok = (config: InternalAxiosRequestConfig): AxiosResponse => ({
  config, data: { ok: true }, status: 200, statusText: 'OK', headers: {},
});
const fail = (config: InternalAxiosRequestConfig, status: number) => new AxiosError(
  `HTTP ${status}`, 'ERR_BAD_RESPONSE', config, undefined,
  { config, data: {}, status, statusText: 'Error', headers: {} },
);

beforeEach(() => localStorage.clear());
afterEach(() => { api.defaults.adapter = originalAdapter; vi.restoreAllMocks(); localStorage.clear(); });

describe('API session and refresh', () => {
  it('čuva i briše oba tokena te šalje Authorization samo kada token postoji', async () => {
    const headers: Array<string | undefined> = [];
    api.defaults.adapter = (async (config) => {
      headers.push(config.headers.get('Authorization') as string | undefined);
      return ok(config);
    }) satisfies AxiosAdapter;
    await api.get('/unprotected');
    setTokens('test-access', 'test-refresh');
    expect(getAccessToken()).toBe('test-access');
    expect(getRefreshToken()).toBe('test-refresh');
    await api.get('/protected');
    expect(headers).toEqual([undefined, 'Bearer test-access']);
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('ne osvježava ako već postoji access token ili nema refresh tokena', async () => {
    const post = vi.spyOn(axios, 'post');
    expect(await ensureAccessToken()).toBeNull();
    setTokens('test-access', 'test-refresh');
    expect(await ensureAccessToken()).toBe('test-access');
    expect(post).not.toHaveBeenCalled();
  });

  it('osvježava i pohranjuje oba nova tokena; odbijanje briše lokalnu sesiju', async () => {
    setTokens('', 'test-refresh');
    const post = vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { accessToken: 'test-new', refreshToken: 'test-new-refresh' } });
    expect(await refreshAccessToken()).toBe('test-new');
    expect(post).toHaveBeenCalledWith(expect.stringMatching(/\/api\/v1\/auth\/refresh$/), { refreshToken: 'test-refresh' });
    expect(getAccessToken()).toBe('test-new');
    expect(getRefreshToken()).toBe('test-new-refresh');
    clearTokens();
    setTokens('', 'test-refresh');
    post.mockRejectedValueOnce(new Error('refresh denied'));
    expect(await ensureAccessToken()).toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('paralelne 401 greške dijele jedno osvježavanje i ponavljaju zahtjeve s novim tokenom', async () => {
    setTokens('test-expired', 'test-refresh');
    let release!: () => void;
    const pending = new Promise<void>((resolve) => { release = resolve; });
    const post = vi.spyOn(axios, 'post').mockImplementation(async () => {
      await pending;
      return { data: { accessToken: 'test-new', refreshToken: 'test-new-refresh' } };
    });
    const sent: string[] = [];
    api.defaults.adapter = (async (config) => {
      const authorization = String(config.headers.get('Authorization') ?? '');
      sent.push(`${config.url}:${authorization}`);
      if (authorization !== 'Bearer test-new') throw fail(config, 401);
      return ok(config);
    }) satisfies AxiosAdapter;
    const a = api.get('/one');
    const b = api.get('/two');
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    release();
    await expect(Promise.all([a, b])).resolves.toHaveLength(2);
    expect(post).toHaveBeenCalledTimes(1);
    expect(sent).toHaveLength(4);
    expect(sent.filter((value) => value.endsWith('Bearer test-new'))).toHaveLength(2);
    expect(getRefreshToken()).toBe('test-new-refresh');
  });

  it('ne pokušava refresh za 403, a neuspjeli refresh briše tokene', async () => {
    setTokens('test-access', 'test-refresh');
    const post = vi.spyOn(axios, 'post');
    api.defaults.adapter = (async (config) => { throw fail(config, 403); }) satisfies AxiosAdapter;
    await expect(api.get('/forbidden')).rejects.toMatchObject({ response: { status: 403 } });
    expect(post).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('test-access');
    post.mockRejectedValueOnce(new Error('refresh denied'));
    api.defaults.adapter = (async (config) => { throw fail(config, 401); }) satisfies AxiosAdapter;
    await expect(api.get('/expired')).rejects.toThrow('refresh denied');
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
