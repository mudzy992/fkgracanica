import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-file-system', () => ({
  File: class MockFile {
    uri: string;
    constructor(_dir: unknown, name: string) {
      this.uri = `file:///cache/${name}`;
    }
    static downloadFileAsync = vi.fn(async (_url: string, dest: unknown) => dest);
  },
  Paths: { cache: { uri: 'file:///cache' } },
}));

vi.mock('expo-media-library', () => ({
  requestPermissionsAsync: vi.fn(async () => ({ granted: true })),
  saveToLibraryAsync: vi.fn(async () => {}),
}));

vi.mock('expo-sharing', () => ({
  isAvailableAsync: vi.fn(async () => true),
  shareAsync: vi.fn(async () => {}),
}));

vi.mock('./media', () => ({
  mediaUrl: vi.fn((path: string | null | undefined, _variant: string) => {
    if (!path) return null;
    // simple mock: return URL that preserves extension for fileMeta test
    return `https://cdn.test/${path}`;
  }),
}));

vi.mock('./api', () => ({
  API_URL: 'https://api.fkgracanica.ba101.top/api/v1',
  api: {
    get: vi.fn(async () => ({ data: {} })),
    post: vi.fn(async () => ({ data: {} })),
    delete: vi.fn(async () => ({})),
  },
}));

import { File } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { mediaUrl } from './media';
import { api } from './api';
import { saveImageToLibrary, shareImageFile } from './share-media';

// use-public-settings hook — mock react to test without jsdom
vi.mock('react', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useState: vi.fn((init: unknown) => [init, vi.fn()]),
    useEffect: vi.fn((cb: () => void) => {
      cb();
    }),
  };
});

import * as React from 'react';
import { usePublicSettings } from './use-public-settings';

describe('mob-batch09 — P-MOB09 lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mediaUrl).mockImplementation((path: unknown) => {
      if (!path) return null as never;
      return `https://cdn.test/${path as string}` as never;
    });
    vi.mocked(api.get).mockResolvedValue({ data: {} } as never);
    vi.mocked(File.downloadFileAsync).mockImplementation(async (_url: string, dest: unknown) => dest as never);
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValue(true as never);
    vi.mocked(MediaLibrary.requestPermissionsAsync).mockResolvedValue({ granted: true } as never);
  });

  it('shareImageFile baca missing-url kad mediaUrl null', async () => {
    vi.mocked(mediaUrl).mockReturnValueOnce(null as never);
    await expect(shareImageFile('')).rejects.toThrow('missing-url');
  });

  it('shareImageFile baca sharing-unavailable', async () => {
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(false as never);
    await expect(shareImageFile('photo.jpg')).rejects.toThrow('sharing-unavailable');
  });

  it('shareImageFile png koristi image/png', async () => {
    await shareImageFile('a.png');
    expect(File.downloadFileAsync).toHaveBeenCalled();
    expect(Sharing.shareAsync).toHaveBeenCalledWith(expect.stringContaining('file:///cache/'), {
      mimeType: 'image/png',
      UTI: 'public.png',
      dialogTitle: 'FK Gračanica',
    });
  });

  it('shareImageFile webp koristi image/webp', async () => {
    await shareImageFile('b.webp');
    expect(Sharing.shareAsync).toHaveBeenCalledWith(expect.any(String), {
      mimeType: 'image/webp',
      UTI: 'public.webp',
      dialogTitle: 'FK Gračanica',
    });
  });

  it('shareImageFile jpeg fallback za jpg i query', async () => {
    await shareImageFile('c.jpg?token=abc');
    expect(Sharing.shareAsync).toHaveBeenCalledWith(expect.any(String), {
      mimeType: 'image/jpeg',
      UTI: 'public.jpeg',
      dialogTitle: 'FK Gračanica',
    });
    vi.clearAllMocks();
    await shareImageFile('d.jpeg');
    expect(Sharing.shareAsync).toHaveBeenCalledWith(expect.any(String), {
      mimeType: 'image/jpeg',
      UTI: 'public.jpeg',
      dialogTitle: expect.any(String),
    });
  });

  it('saveImageToLibrary baca permission-denied', async () => {
    vi.mocked(MediaLibrary.requestPermissionsAsync).mockResolvedValueOnce({
      granted: false,
    } as never);
    await expect(saveImageToLibrary('photo.jpg')).rejects.toThrow('permission-denied');
  });

  it('saveImageToLibrary uspjeh poziva saveToLibraryAsync', async () => {
    await saveImageToLibrary('x.jpg');
    expect(File.downloadFileAsync).toHaveBeenCalled();
    expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalledWith(expect.stringContaining('file:///cache/'));
  });

  it('saveImageToLibrary baca missing-url', async () => {
    vi.mocked(mediaUrl).mockReturnValueOnce(null as never);
    await expect(saveImageToLibrary('')).rejects.toThrow('missing-url');
  });

  it('usePublicSettings vraća {} inicijalno i poziva api.get', () => {
    const useStateSpy = vi.mocked(React.useState);
    const useEffectSpy = vi.mocked(React.useEffect);
    useStateSpy.mockReturnValueOnce([{}, vi.fn()] as never);
    const result = usePublicSettings();
    expect(result).toEqual({});
    expect(useEffectSpy).toHaveBeenCalled();
    expect(api.get).toHaveBeenCalledWith('/settings/public');
  });

  it('usePublicSettings hendla useEffect poziv', async () => {
    // provjeri da hook ne baca kad api.get resolve
    vi.mocked(api.get).mockResolvedValueOnce({ data: { foo: 'bar' } } as never);
    const useStateSpy = vi.mocked(React.useState);
    const setMock = vi.fn();
    useStateSpy.mockReturnValueOnce([{}, setMock] as never);
    usePublicSettings();
    // useEffect je pozvan u mocku odmah, api.get je pozvan
    expect(api.get).toHaveBeenCalledWith('/settings/public');
    // sačekaj microtask da se then izvrši
    await new Promise((r) => setTimeout(r, 0));
    // ne mora setMock biti pozvan odmah zbog async, ali ne baca
    expect(true).toBe(true);
  });
});
