import { useEffect, useRef } from 'react';
import { parseYouTubeId } from '../lib/youtube';
import { loadYouTubeApi, type YtPlayer } from '../lib/youtube-api';
import { useYouTubeStreamPlayer } from './use-youtube-stream-player';

let pointerFallbackBound = false;

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

function useYouTubeAudioEmbed(url: string, active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const videoId = parseYouTubeId(url);

  useEffect(() => {
    if (!active || !videoId || !containerRef.current) return;

    let cancelled = false;
    let retryTimer: number | undefined;

    const tryPlay = () => {
      const p = playerRef.current;
      if (!p) return;
      p.unMute();
      p.setVolume(100);
      p.playVideo();
    };

    // Mrežni pad učitavanja YouTube API-ja ne smije ostaviti neuhvaćen rejection.
    void loadYouTubeApi()
      .catch(() => undefined)
      .then(() => {
        if (cancelled || !containerRef.current || !window.YT?.Player) return;
        playerRef.current?.destroy();
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: { ...AUDIO_VARS, enablejsapi: 1, origin: window.location.origin },
          events: {
            onReady: ({ target }) => {
              target.unMute();
              target.setVolume(100);
              target.playVideo();
              bindPointerFallback(tryPlay);
            },
            onStateChange: ({ data, target }) => {
              const PS = window.YT?.PlayerState;
              if (PS && (data === PS.PAUSED || data === PS.CUED)) {
                target.playVideo();
                window.clearTimeout(retryTimer);
                retryTimer = window.setTimeout(tryPlay, 800);
              }
            },
          },
        });
      });

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [active, videoId]);

  return { containerRef, videoId };
}

export function useYouTubeAudioPlayer(url: string, active: boolean) {
  return useYouTubeAudioEmbed(url, active);
}

export { useYouTubeStreamPlayer };

/** @deprecated Use useYouTubeStreamPlayer or useYouTubeAudioPlayer */
export function useYouTubePlayer(url: string, active: boolean) {
  return useYouTubeStreamPlayer(url, active);
}
