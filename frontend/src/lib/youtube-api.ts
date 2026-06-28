type YtState = -1 | 0 | 1 | 2 | 3 | 5;

export type YtPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (n: number) => void;
  destroy: () => void;
  getPlayerState?: () => YtState;
  getAvailableQualityLevels?: () => string[];
  getPlaybackQuality?: () => string;
  setPlaybackQuality?: (q: string) => void;
  loadVideoById?: (videoId: string, startSeconds?: number) => void;
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
            onPlaybackQualityChange?: (e: { data: string; target: YtPlayer }) => void;
          };
        },
      ) => YtPlayer;
      PlayerState?: { PAUSED: 2; CUED: 5; PLAYING: 1 };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

export function loadYouTubeApi(): Promise<void> {
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

export type { YtState };
