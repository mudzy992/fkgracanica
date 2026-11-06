import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { latestApkDownloadUrl, useLatestAndroidRelease } from './use-latest-android-release';

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

let client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

const release = {
  version: '1.4.0',
  versionCode: 14,
  apkUrl: 'https://cdn.test/app.apk',
  apkSizeBytes: 2048,
  releaseNotes: 'Nove funkcije',
  publishedAt: '2026-11-01T10:00:00.000Z',
};

const axiosError = (status: number) =>
  Object.assign(new Error(`Request failed ${status}`), {
    isAxiosError: true,
    response: { status },
  });

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  api.get.mockReset();
});

describe('latestApkDownloadUrl', () => {
  it('vraća apsolutnu adresu za preuzimanje APK-a', () => {
    expect(latestApkDownloadUrl()).toBe(
      'http://localhost:3000/api/v1/public/app-releases/android/latest/download',
    );
  });
});

describe('useLatestAndroidRelease', () => {
  it('dohvata najnovije izdanje', async () => {
    api.get.mockResolvedValue({ data: release });
    const { result } = renderHook(() => useLatestAndroidRelease(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(release));
    expect(api.get).toHaveBeenCalledWith('/public/app-releases/android/latest');
  });

  it('404 znači da izdanja nema i nije greška', async () => {
    api.get.mockRejectedValue(axiosError(404));
    const { result } = renderHook(() => useLatestAndroidRelease(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  it('druge greške se propagiraju', async () => {
    api.get.mockRejectedValue(axiosError(500));
    const { result } = renderHook(() => useLatestAndroidRelease(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it('obična greška bez axios oznake se takođe propagira', async () => {
    api.get.mockRejectedValue(new Error('mreža'));
    const { result } = renderHook(() => useLatestAndroidRelease(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
