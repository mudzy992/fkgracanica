export function streamEmbedDimensions() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isLarge = w >= 1024;
  return {
    width: Math.max(w, isLarge ? 1920 : 1280),
    height: Math.max(h, isLarge ? 1080 : 720),
  };
}

export function waitForElementSize(el: HTMLElement, minW = 640, minH = 360): Promise<void> {
  return new Promise((resolve) => {
    const tick = () => {
      if (el.clientWidth >= minW && el.clientHeight >= minH) resolve();
      else requestAnimationFrame(tick);
    };
    tick();
  });
}

const QUALITY_RANK: Record<string, number> = {
  highres: 6,
  hd1080: 5,
  hd720: 4,
  large: 3,
  medium: 2,
  small: 1,
};

type QualityPlayer = {
  getAvailableQualityLevels?: () => string[];
  setPlaybackQuality?: (q: string) => void;
};

export function applyBestPlaybackQuality(player: QualityPlayer) {
  const levels = player.getAvailableQualityLevels?.() ?? [];
  if (!levels.length || !player.setPlaybackQuality) return;
  const best = levels.reduce(
    (top, q) => ((QUALITY_RANK[q] ?? 0) > (QUALITY_RANK[top] ?? 0) ? q : top),
    levels[0],
  );
  player.setPlaybackQuality(best);
}
