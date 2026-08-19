function firstSegment(path: string): string | null {
  const part = path.split('/').filter(Boolean)[0];
  return part || null;
}

export function parseYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return firstSegment(parsed.pathname);
    if (!host.endsWith('youtube.com')) return null;
    const v = parsed.searchParams.get('v');
    if (v) return v;
    const named = parsed.pathname.match(/\/(embed|live|shorts)\/([^/?]+)/);
    return named?.[2] ?? null;
  } catch {
    return null;
  }
}
