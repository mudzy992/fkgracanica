export function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.replace(/^\//, '').split('/')[0] || null;
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const embed = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return embed[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function parseYouTubeStart(url: string): number | undefined {
  try {
    const u = new URL(url);
    const start = u.searchParams.get('start') ?? u.searchParams.get('t');
    if (!start) return undefined;
    const n = Number.parseInt(start, 10);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  } catch {
    return undefined;
  }
}
