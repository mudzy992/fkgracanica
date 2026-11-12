import { afterEach, describe, expect, it, vi } from 'vitest';

describe('loadYouTubeApi', () => {
  afterEach(() => {
    vi.resetModules();
    delete (window as unknown as { YT?: unknown }).YT;
    delete window.onYouTubeIframeAPIReady;
    document.querySelectorAll('script[src*="youtube.com/iframe_api"]').forEach((s) => s.remove());
  });

  it('odmah se razrješava kada je API već učitan', async () => {
    (window as unknown as { YT: unknown }).YT = { Player: function Player() {} };
    const { loadYouTubeApi } = await import('./youtube-api');
    await expect(loadYouTubeApi()).resolves.toBeUndefined();
    expect(document.querySelector('script[src*="youtube.com/iframe_api"]')).toBeNull();
  });

  it('ubacuje skriptu jednom i razrješava se kroz onYouTubeIframeAPIReady', async () => {
    const { loadYouTubeApi } = await import('./youtube-api');
    const first = loadYouTubeApi();
    const second = loadYouTubeApi();
    expect(document.querySelectorAll('script[src*="youtube.com/iframe_api"]')).toHaveLength(1);
    expect(window.onYouTubeIframeAPIReady).toBeTypeOf('function');
    window.onYouTubeIframeAPIReady?.();
    await expect(first).resolves.toBeUndefined();
    await expect(second).resolves.toBeUndefined();
  });

  it('čuva prethodni globalni handler', async () => {
    const previous = vi.fn();
    window.onYouTubeIframeAPIReady = previous;
    const { loadYouTubeApi } = await import('./youtube-api');
    const pending = loadYouTubeApi();
    window.onYouTubeIframeAPIReady?.();
    await pending;
    expect(previous).toHaveBeenCalledTimes(1);
  });

  it('ne ubacuje drugu skriptu ako već postoji u dokumentu', async () => {
    const existing = document.createElement('script');
    existing.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(existing);
    const { loadYouTubeApi } = await import('./youtube-api');
    const pending = loadYouTubeApi();
    expect(document.querySelectorAll('script[src*="youtube.com/iframe_api"]')).toHaveLength(1);
    window.onYouTubeIframeAPIReady?.();
    await pending;
  });
});
