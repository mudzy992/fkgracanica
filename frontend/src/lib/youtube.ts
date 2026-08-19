function firstSegment(path: string): string | null {
  const part = path.split('/').filter(Boolean)[0];
  return part || null;
}

export function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return firstSegment(u.pathname);
    if (!host.endsWith('youtube.com')) return null;
    const v = u.searchParams.get('v');
    if (v) return v;
    const named = u.pathname.match(/\/(embed|live|shorts)\/([^/?]+)/);
    return named?.[2] ?? null;
  } catch {
    return null;
  }
}
