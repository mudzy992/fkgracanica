import { useEffect, useRef } from 'react';
import { parseYouTubeId } from '../lib/youtube';
import { waitForElementSize } from '../lib/youtube-stream.util';
import { loadYouTubeApi, type YtPlayer } from '../lib/youtube-api';

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

function playLive(player: YtPlayer) {
  player.unMute();
  player.setVolume(100);
  player.playVideo();
}

function pauseLive(player: YtPlayer) {
  player.mute();
  player.pauseVideo();
}

export function useYouTubeStreamPlayer(url: string, active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const activeRef = useRef(active);
  const readyRef = useRef(false);
  const videoId = parseYouTubeId(url);

  activeRef.current = active;

  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    let cancelled = false;
    const el = containerRef.current;

    void (async () => {
      await waitForElementSize(el);
      await loadYouTubeApi();
      if (cancelled || !containerRef.current || !window.YT?.Player) return;

      const w = el.clientWidth;
      const h = el.clientHeight;

      playerRef.current?.destroy();
      readyRef.current = false;
      playerRef.current = new window.YT!.Player(containerRef.current, {
        width: w,
        height: h,
        videoId,
        playerVars: { ...STREAM_VARS, enablejsapi: 1, origin: window.location.origin },
        events: {
          onReady: ({ target }) => {
            readyRef.current = true;
            if (activeRef.current) playLive(target);
            else pauseLive(target);
          },
        },
      });
    })();

    return () => {
      cancelled = true;
      readyRef.current = false;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    if (active) playLive(p);
    else pauseLive(p);
  }, [active]);

  return { containerRef, videoId };
}
