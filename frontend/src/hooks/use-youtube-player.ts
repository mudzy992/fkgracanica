import { useEffect, useRef } from 'react';
import { parseYouTubeId } from '../lib/youtube';
import {
  applyBestPlaybackQuality,
  streamEmbedDimensions,
  waitForElementSize,
} from '../lib/youtube-stream.util';

type YtState = -1 | 0 | 1 | 2 | 3 | 5;

type YtPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (n: number) => void;
  destroy: () => void;
  getPlayerState?: () => YtState;
  getAvailableQualityLevels?: () => string[];
  setPlaybackQuality?: (q: string) => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string;
          width?: number;
          height?: number;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YtPlayer }) => void;
            onStateChange?: (e: { data: YtState; target: YtPlayer }) => void;
            onPlaybackQualityChange?: (e: { target: YtPlayer }) => void;
          };
        },
      ) => YtPlayer;
      PlayerState?: { PAUSED: 2; CUED: 5; PLAYING: 1 };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
let pointerFallbackBound = false;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    });
  }
  return apiPromise;
}

function bindPointerFallback(tryPlay: () => void) {
  if (pointerFallbackBound) return;
  pointerFallbackBound = true;
  const once = () => {
    tryPlay();
    window.removeEventListener('pointerdown', once, true);
    pointerFallbackBound = false;
  };
  window.addEventListener('pointerdown', once, true);
}

function playUnmuted(player: YtPlayer) {
  player.unMute();
  player.setVolume(100);
  player.playVideo();
  applyBestPlaybackQuality(player);
}

function pauseMuted(player: YtPlayer) {
  player.mute();
  player.pauseVideo();
}

type EmbedOpts = { resumeOnPause: boolean; keepAlive?: boolean; hdSize?: boolean };

function useYouTubeEmbed(
  url: string,
  active: boolean,
  playerVars: Record<string, number | string>,
  opts: EmbedOpts,
) {
  const { resumeOnPause, keepAlive = false, hdSize = false } = opts;
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const activeRef = useRef(active);
  const retryRef = useRef(0);
  const videoId = parseYouTubeId(url);

  activeRef.current = active;

  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    if (!keepAlive && !active) return;

    let cancelled = false;
    let retryTimer: number | undefined;
    const el = containerRef.current;

    const tryPlay = () => {
      const p = playerRef.current;
      if (!p || !activeRef.current) return;
      playUnmuted(p);
    };

    const scheduleRetry = () => {
      if (!resumeOnPause || !activeRef.current || retryRef.current > 8) return;
      retryRef.current += 1;
      window.clearTimeout(retryTimer);
      retryTimer = window.setTimeout(tryPlay, 800);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && activeRef.current) tryPlay();
    };

    void (async () => {
      await waitForElementSize(el);
      await loadYouTubeApi();
      if (cancelled || !containerRef.current || !window.YT?.Player) return;

      playerRef.current?.destroy();
      retryRef.current = 0;
      const size = hdSize ? streamEmbedDimensions() : undefined;
      playerRef.current = new window.YT.Player(containerRef.current, {
        ...size,
        videoId,
        playerVars: { ...playerVars, enablejsapi: 1, origin: window.location.origin },
        events: {
          onReady: ({ target }) => {
            if (activeRef.current) {
              playUnmuted(target);
              bindPointerFallback(tryPlay);
            } else pauseMuted(target);
            window.setTimeout(() => applyBestPlaybackQuality(target), 1500);
          },
          onStateChange: ({ data, target }) => {
            const PS = window.YT?.PlayerState;
            if (data === PS?.PLAYING) applyBestPlaybackQuality(target);
            if (!resumeOnPause || !activeRef.current || !PS) return;
            if (data === PS.PAUSED || data === PS.CUED) {
              target.playVideo();
              scheduleRetry();
            }
          },
          onPlaybackQualityChange: ({ target }) => applyBestPlaybackQuality(target),
        },
      });
    })();

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId, keepAlive, hdSize, resumeOnPause, playerVars]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    if (active) playUnmuted(p);
    else if (keepAlive) pauseMuted(p);
  }, [active, keepAlive]);

  return { containerRef, videoId };
}

const AUDIO_VARS = {
  autoplay: 1,
  mute: 0,
  controls: 0,
  disablekb: 1,
  fs: 0,
  playsinline: 1,
  rel: 0,
  modestbranding: 1,
  iv_load_policy: 3,
};

const STREAM_VARS = {
  autoplay: 1,
  mute: 0,
  controls: 0,
  disablekb: 1,
  fs: 0,
  playsinline: 1,
  rel: 0,
  modestbranding: 1,
  iv_load_policy: 3,
};

export function useYouTubeAudioPlayer(url: string, active: boolean) {
  return useYouTubeEmbed(url, active, AUDIO_VARS, { resumeOnPause: true });
}

export function useYouTubeStreamPlayer(url: string, active: boolean) {
  return useYouTubeEmbed(url, active, STREAM_VARS, {
    resumeOnPause: true,
    keepAlive: true,
    hdSize: true,
  });
}

/** @deprecated Use useYouTubeStreamPlayer or useYouTubeAudioPlayer */
export function useYouTubePlayer(url: string, active: boolean) {
  return useYouTubeStreamPlayer(url, active);
}
