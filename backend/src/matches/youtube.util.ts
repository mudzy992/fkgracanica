// Keep the matching backend/frontend URL policies in sync.
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const DNS_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function isYouTubeHost(host: string): boolean {
  if (host === 'youtube.com') return true;
  if (!host.endsWith('.youtube.com')) return false;
  const subdomain = host.slice(0, -'.youtube.com'.length);
  return subdomain.split('.').every((label) => DNS_LABEL.test(label));
}

export function parseYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password
    )
      return null;

    let id: string | null = null;
    if (parsed.hostname === 'youtu.be' || parsed.hostname === 'www.youtu.be') {
      id = /^\/([^/]+)\/?$/.exec(parsed.pathname)?.[1] ?? null;
    } else if (isYouTubeHost(parsed.hostname)) {
      id = /^\/watch\/?$/.test(parsed.pathname)
        ? parsed.searchParams.get('v')
        : (/^\/(?:embed|live|shorts)\/([^/]+)\/?$/.exec(parsed.pathname)?.[1] ??
          null);
    }
    return id && id.length === 11 && VIDEO_ID.test(id) ? id : null;
  } catch {
    return null;
  }
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
