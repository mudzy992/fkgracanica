// Keep the matching backend/frontend URL policies in sync.
const VIDEO_ID = /^[\w-]{11}$/;
export function isYouTubeVideoId(id: string): boolean {
  return id.length === 11 && VIDEO_ID.test(id);
}

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
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password)
      return null;

    let id: string | null = null;
    if (parsed.hostname === 'youtu.be' || parsed.hostname === 'www.youtu.be') {
      id = /^\/([^/]+)\/?$/.exec(parsed.pathname)?.[1] ?? null;
    } else if (isYouTubeHost(parsed.hostname)) {
      id = /^\/watch\/?$/.test(parsed.pathname)
        ? parsed.searchParams.get('v')
        : /^\/(?:embed|live|shorts)\/([^/]+)\/?$/.exec(parsed.pathname)?.[1] ?? null;
    }
    return id && isYouTubeVideoId(id) ? id : null;
  } catch {
    return null;
  }
}

/** Empty optional fields can be cleared; an unchanged legacy value is not rewritten. */
export function isInvalidChangedYouTubeUrl(value: string | null | undefined, previous?: string | null): boolean {
  if (value == null || value === (previous ?? '')) return false;
  return !!value.trim() && !parseYouTubeId(value);
}

const NUMBER_PARAMS = new Set('autoplay controls disablekb enablejsapi end fs index iv_load_policy loop modestbranding mute playsinline rel start cc_load_policy'.split(' '));

function isPlaylistId(value: string): boolean {
  return value.length >= 2 && value.length <= 128 && !/[^\w-]/.test(value);
}

function isSafeOrigin(value: string): boolean {
  try {
    const origin = new URL(value);
    return ['http:', 'https:'].includes(origin.protocol) && origin.href === `${origin.origin}/`;
  } catch {
    return false;
  }
}

function allowedParam(key: string, value: string): boolean {
  if (NUMBER_PARAMS.has(key)) return /^\d{1,10}(?![\s\S])/.test(value);
  if (key === 'list') return isPlaylistId(value);
  if (key === 'playlist') {
    const ids = value.split(',');
    return ids.length <= 50 && ids.every(isYouTubeVideoId);
  }
  if (key === 'hl' || key === 'cc_lang_pref') return value.length > 0 && value.length <= 35 && !/[^A-Za-z0-9-]/.test(value);
  if (key === 'color') return value === 'red' || value === 'white';
  if (key === 'origin') return isSafeOrigin(value);
  return false;
}

/** Canonicalize YouTube embeds; retain the pre-existing Vimeo provider policy. */
export function safeRichIframeSrc(value: string): string | null {
  try {
    const source = new URL(value);
    if (source.protocol !== 'https:' || source.username || source.password || source.port) return null;
    const host = source.hostname.replace(/^www\./, '');
    if (host === 'player.vimeo.com') return source.toString();
    if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null;
    const match = /^\/embed\/([^/]+)\/?$/.exec(source.pathname);
    const id = match?.[1];
    if (!id || (id !== 'videoseries' && !isYouTubeVideoId(id))) return null;
    if (id === 'videoseries' && !isPlaylistId(source.searchParams.get('list') ?? '')) return null;

    const safe = new URL(`https://${source.hostname}/embed/${id}`);
    for (const [key, param] of source.searchParams) {
      if (allowedParam(key, param)) safe.searchParams.append(key, param);
    }
    return safe.toString();
  } catch {
    return null;
  }
}
