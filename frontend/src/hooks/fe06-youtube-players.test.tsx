import { render, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useYouTubeAudioPlayer, useYouTubePlayer, useYouTubeStreamPlayer } from './use-youtube-player';

const ytApi = vi.hoisted(() => ({ loadYouTubeApi: vi.fn(() => Promise.resolve()) }));
vi.mock('../lib/youtube-api', () => ytApi);
vi.mock('../lib/youtube-stream.util', () => ({ waitForElementSize: () => Promise.resolve() }));

type Opts = { videoId: string; width?: number; height?: number; playerVars?: Record<string, number | string>; events?: { onReady?: (e: { target: unknown }) => void; onStateChange?: (e: { data: number; target: unknown }) => void } };

type PlayerApi = Record<'playVideo' | 'pauseVideo' | 'mute' | 'unMute' | 'setVolume' | 'destroy', ReturnType<typeof vi.fn>>;

const YOUTUBE = 'https://www.youtube.com/watch?v=abcdefghijk';

function createPlayer(): PlayerApi {
  return {
    playVideo: vi.fn(), pauseVideo: vi.fn(), mute: vi.fn(),
    unMute: vi.fn(), setVolume: vi.fn(), destroy: vi.fn(),
  };
}

function installYt() {
  const instances: Array<{ el: HTMLElement | string; opts: Opts; player: PlayerApi }> = [];
  class FakePlayer {
    constructor(el: HTMLElement | string, opts: Opts) {
      const player = createPlayer();
      Object.assign(this, player);
      instances.push({ el, opts, player });
    }
  }
  (window as unknown as { YT: unknown }).YT = {
    PlayerState: { PAUSED: 2, CUED: 5, PLAYING: 1 },
    Player: FakePlayer,
  };
  return instances;
}

function StreamHost({ url, active }: { url: string; active: boolean }) {
  const { containerRef, videoId } = useYouTubeStreamPlayer(url, active);
  return <div ref={containerRef} data-testid="yt" data-vid={videoId ?? ''} />;
}

function AudioHost({ url, active }: { url: string; active: boolean }) {
  const { containerRef, videoId } = useYouTubeAudioPlayer(url, active);
  return <div ref={containerRef} data-testid="audio" data-vid={videoId ?? ''} />;
}

async function flush() {
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
}

beforeEach(() => {
  vi.clearAllMocks();
  delete (window as unknown as { YT?: unknown }).YT;
});

describe('useYouTubeStreamPlayer', () => {
  it('bez videoId-a ne učitava API', async () => {
    const { getByTestId } = render(<StreamHost url="https://example.com/nic" active />);
    await flush();
    expect(getByTestId('yt').dataset.vid).toBe('');
    expect(ytApi.loadYouTubeApi).not.toHaveBeenCalled();
  });

  it('kreira plejer sa veličinom elementa i pušta strim kada je aktivan', async () => {
    const instances = installYt();
    const { getByTestId } = render(<StreamHost url={YOUTUBE} active />);
    await flush();
    expect(getByTestId('yt').dataset.vid).toBe('abcdefghijk');
    expect(instances).toHaveLength(1);
    expect(instances[0].opts.videoId).toBe('abcdefghijk');
    expect(instances[0].opts.playerVars).toMatchObject({ autoplay: 1, mute: 0, controls: 0, enablejsapi: 1 });
    act(() => instances[0].opts.events?.onReady?.({ target: instances[0].player }));
    expect(instances[0].player.unMute).toHaveBeenCalled();
    expect(instances[0].player.setVolume).toHaveBeenCalledWith(100);
    expect(instances[0].player.playVideo).toHaveBeenCalled();
  });

  it('neaktivan plejer se utišava i pauzira, a promjena aktivnosti djeluje odmah', async () => {
    const instances = installYt();
    const { rerender } = render(<StreamHost url={YOUTUBE} active={false} />);
    await flush();
    act(() => instances[0].opts.events?.onReady?.({ target: instances[0].player }));
    expect(instances[0].player.mute).toHaveBeenCalled();
    expect(instances[0].player.pauseVideo).toHaveBeenCalled();
    rerender(<StreamHost url={YOUTUBE} active />);
    expect(instances[0].player.playVideo).toHaveBeenCalled();
    rerender(<StreamHost url={YOUTUBE} active={false} />);
    expect(instances[0].player.pauseVideo).toHaveBeenCalledTimes(2);
  });

  it('unmount ruši plejer instance', async () => {
    const instances = installYt();
    const { unmount } = render(<StreamHost url={YOUTUBE} active />);
    await flush();
    unmount();
    expect(instances[0].player.destroy).toHaveBeenCalled();
  });

  it('odgođeno učitavanje API-ja nakon unmounta ne kreira plejer', async () => {
    let resolveLoad!: () => void;
    const deferred = new Promise<void>((done) => { resolveLoad = done; });
    ytApi.loadYouTubeApi.mockReturnValueOnce(deferred);
    const instances = installYt();
    const { unmount } = render(<StreamHost url={YOUTUBE} active />);
    unmount();
    resolveLoad();
    await flush();
    expect(instances).toHaveLength(0);
  });

  it('učitan API bez window.YT ne kreira plejer i ne pada', async () => {
    const { getByTestId } = render(<StreamHost url={YOUTUBE} active />);
    await flush();
    expect(getByTestId('yt').dataset.vid).toBe('abcdefghijk');
    expect((window as unknown as { YT?: unknown }).YT).toBeUndefined();
  });

  it('deprecated useYouTubePlayer radi isto što i stream varijanta', async () => {
    const instances = installYt();
    function LegacyHost() {
      const { containerRef } = useYouTubePlayer(YOUTUBE, true);
      return <div ref={containerRef} />;
    }
    render(<LegacyHost />);
    await flush();
    expect(instances).toHaveLength(1);
  });
});

describe('useYouTubeAudioPlayer', () => {
  it('na ready uključuje zvuk i pušta audio embed', async () => {
    const instances = installYt();
    const { getByTestId } = render(<AudioHost url="https://youtu.be/zyxwvutsrqp" active />);
    await flush();
    expect(getByTestId('audio').dataset.vid).toBe('zyxwvutsrqp');
    expect(instances[0].opts.playerVars).toMatchObject({ autoplay: 1, controls: 0, enablejsapi: 1 });
    act(() => instances[0].opts.events?.onReady?.({ target: instances[0].player }));
    expect(instances[0].player.unMute).toHaveBeenCalled();
    expect(instances[0].player.setVolume).toHaveBeenCalledWith(100);
    expect(instances[0].player.playVideo).toHaveBeenCalled();
  });

  it('pauza ili cue ponovo pokreću reprodukciju', async () => {
    const instances = installYt();
    render(<AudioHost url={YOUTUBE} active />);
    await flush();
    act(() => instances[0].opts.events?.onReady?.({ target: instances[0].player }));
    instances[0].player.playVideo.mockClear();
    act(() => instances[0].opts.events?.onStateChange?.({ data: 2, target: instances[0].player }));
    expect(instances[0].player.playVideo).toHaveBeenCalledTimes(1);
    act(() => instances[0].opts.events?.onStateChange?.({ data: 5, target: instances[0].player }));
    expect(instances[0].player.playVideo).toHaveBeenCalledTimes(2);
    act(() => instances[0].opts.events?.onStateChange?.({ data: 1, target: instances[0].player }));
    expect(instances[0].player.playVideo).toHaveBeenCalledTimes(2);
  });

  it('neaktivan audio embed se ne kreira', async () => {
    const instances = installYt();
    render(<AudioHost url={YOUTUBE} active={false} />);
    await flush();
    expect(instances).toHaveLength(0);
  });
});
