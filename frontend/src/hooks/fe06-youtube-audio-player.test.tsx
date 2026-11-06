import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useYouTubeAudioPlayer, useYouTubePlayer } from './use-youtube-player';

const state = vi.hoisted(() => ({
  load: vi.fn(),
}));

vi.mock('../lib/youtube-api', () => ({ loadYouTubeApi: () => state.load() }));

type Handler = (arg: { data: number; target: Record<string, ReturnType<typeof vi.fn>> }) => void;
type YtHarness = { handlers: Record<string, Handler>; player: Record<string, ReturnType<typeof vi.fn>> };

function installYt(): YtHarness {
  const handlers: Record<string, Handler> = {};
  const player = {
    unMute: vi.fn(),
    setVolume: vi.fn(),
    playVideo: vi.fn(),
    destroy: vi.fn(),
  };
  (window as unknown as { YT: unknown }).YT = {
    Player: vi.fn(function (_el: unknown, config: { events: Record<string, Handler> }) {
      Object.assign(handlers, config.events);
      return player;
    }),
    PlayerState: { PAUSED: 2, CUED: 5, PLAYING: 1 },
  };
  return { handlers, player };
}

function AudioHarness({ url, active }: { url: string; active: boolean }) {
  const { containerRef, videoId } = useYouTubeAudioPlayer(url, active);
  return (
    <div>
      <span data-testid="video-id">{videoId ?? 'nema'}</span>
      <div ref={containerRef} data-testid="container" />
    </div>
  );
}

const playerConfig = () => {
  const Player = (window as unknown as { YT: { Player: ReturnType<typeof vi.fn> } }).YT.Player;
  return Player.mock.calls.at(-1)?.[1] as {
    videoId: string;
    playerVars: Record<string, unknown>;
  };
};

beforeEach(() => {
  state.load = vi.fn().mockResolvedValue(undefined);
});

afterEach(() => {
  delete (window as unknown as { YT?: unknown }).YT;
  vi.restoreAllMocks();
});

describe('useYouTubeAudioPlayer', () => {
  it('izvlači video ID iz URL-a', () => {
    render(<AudioHarness url="https://youtu.be/dQw4w9WgXcQ" active={false} />);
    expect(screen.getByTestId('video-id')).toHaveTextContent('dQw4w9WgXcQ');
  });

  it('neispravan URL nema ID i ne učitava API', () => {
    render(<AudioHarness url="https://example.com/x" active />);
    expect(screen.getByTestId('video-id')).toHaveTextContent('nema');
    expect(state.load).not.toHaveBeenCalled();
  });

  it('neaktivan audio ne učitava API', () => {
    render(<AudioHarness url="https://youtu.be/dQw4w9WgXcQ" active={false} />);
    expect(state.load).not.toHaveBeenCalled();
  });

  it('aktivan audio kreira YT player sa audio varijablama', async () => {
    const { handlers } = installYt();
    render(<AudioHarness url="https://youtu.be/dQw4w9WgXcQ" active />);
    await waitFor(() => expect(handlers.onReady).toBeTruthy());
    const config = playerConfig();
    expect(config.videoId).toBe('dQw4w9WgXcQ');
    expect(config.playerVars).toMatchObject({ autoplay: 1, controls: 0, mute: 0, enablejsapi: 1 });
  });

  it('onReady odmah pušta zvuk i registruje fallback na pokazivač', async () => {
    const { handlers, player } = installYt();
    render(<AudioHarness url="https://youtu.be/dQw4w9WgXcQ" active />);
    await waitFor(() => expect(handlers.onReady).toBeTruthy());
    handlers.onReady({ data: 0, target: player } as never);
    expect(player.unMute).toHaveBeenCalled();
    expect(player.setVolume).toHaveBeenCalledWith(100);
    expect(player.playVideo).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event('pointerdown'));
    expect(player.playVideo).toHaveBeenCalledTimes(2);
    window.dispatchEvent(new Event('pointerdown'));
    expect(player.playVideo).toHaveBeenCalledTimes(2);
    expect(player.destroy).not.toHaveBeenCalled();
  });

  it('pauza i cue ponovo pokreću reprodukciju sa odgođenim pokušajem', async () => {
    const { handlers, player } = installYt();
    render(<AudioHarness url="https://youtu.be/dQw4w9WgXcQ" active />);
    await waitFor(() => expect(handlers.onStateChange).toBeTruthy());
    handlers.onReady({ target: player } as never);
    player.playVideo.mockClear();
    handlers.onStateChange({ data: 2, target: player } as never);
    expect(player.playVideo).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(player.playVideo).toHaveBeenCalledTimes(2), { timeout: 2000 });
    handlers.onStateChange({ data: 5, target: player } as never);
    expect(player.playVideo).toHaveBeenCalledTimes(3);
    handlers.onStateChange({ data: 1, target: player } as never);
    expect(player.playVideo).toHaveBeenCalledTimes(3);
  });

  it('unmount uništava player', async () => {
    const { handlers, player } = installYt();
    const { unmount } = render(<AudioHarness url="https://youtu.be/dQw4w9WgXcQ" active />);
    await waitFor(() => expect(handlers.onReady).toBeTruthy());
    handlers.onReady({ target: player } as never);
    unmount();
    expect(player.destroy).toHaveBeenCalled();
  });

  it('loadYouTubeApi odbijanje ne ruši hook', async () => {
    state.load = vi.fn().mockRejectedValue(new Error('offline'));
    installYt();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<AudioHarness url="https://youtu.be/dQw4w9WgXcQ" active />);
    await waitFor(() => expect(state.load).toHaveBeenCalled());
    spy.mockRestore();
  });
});

function DeprecatedHarness() {
  const out = useYouTubePlayer('https://youtu.be/dQw4w9WgXcQ', false);
  useEffect(() => {
    void out;
  }, [out]);
  return <div data-testid="deprecated">ok</div>;
}

describe('useYouTubePlayer (deprecated)', () => {
  it('delegira na stream player bez pada', () => {
    render(<DeprecatedHarness />);
    expect(screen.getByTestId('deprecated')).toBeInTheDocument();
  });
});
