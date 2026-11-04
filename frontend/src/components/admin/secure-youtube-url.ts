import { parseYouTubeId, safeRichIframeSrc } from '../../lib/youtube';

/** YouTube toolbar/paste may accept watch and playlist URLs, but always renders an HTTPS embed. */
export function safeEditorYoutubeSrc(value: string): string | null {
  try {
    const source = new URL(value.trim());
    if (
      !['http:', 'https:'].includes(source.protocol) ||
      source.username ||
      source.password ||
      source.port
    )
      return null;
    const host = source.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const direct = safeRichIframeSrc(source.href);
      if (direct) return direct;
      if (source.pathname === '/playlist') {
        const playlist = new URL('https://www.youtube-nocookie.com/embed/videoseries');
        for (const [key, param] of source.searchParams) playlist.searchParams.append(key, param);
        return safeRichIframeSrc(playlist.href);
      }
    }
    const id = parseYouTubeId(value);
    if (!id) return null;
    const embed = new URL(`https://www.youtube.com/embed/${id}`);
    for (const [key, param] of source.searchParams) {
      if (key === 'v') continue;
      if (key === 't' && !source.searchParams.has('start'))
        embed.searchParams.append('start', param);
      else if (key !== 't') embed.searchParams.append(key, param);
    }
    return safeRichIframeSrc(embed.href);
  } catch {
    return null;
  }
}

/** Paste rules only convert whole, valid URL tokens; invalid links remain ordinary text. */
export function safeYoutubePasteMatches(text: string) {
  return [...text.matchAll(/https?:\/\/[^\s<>"']+/g)]
    .filter((match) => safeEditorYoutubeSrc(match[0]))
    .map((match) => ({ index: match.index!, text: match[0] }));
}

/** Only newly pasted HTML is changed. Existing stored content is never passed through this. */
export function sanitizePastedIframes(html: string, unavailable: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;
  const allowed = new Set([
    'src',
    'title',
    'width',
    'height',
    'allow',
    'allowfullscreen',
    'frameborder',
    'class',
  ]);
  for (const frame of template.content.querySelectorAll('iframe')) {
    const src = frame.getAttribute('src');
    const safe = src && (safeRichIframeSrc(src) ?? safeEditorYoutubeSrc(src));
    if (!safe) {
      const notice = document.createElement('p');
      notice.textContent = unavailable;
      frame.replaceWith(notice);
      continue;
    }
    for (const attr of Array.from(frame.attributes))
      if (!allowed.has(attr.name)) frame.removeAttribute(attr.name);
    frame.setAttribute('src', safe);
    const wrapper = frame.parentElement;
    if (wrapper?.matches('div[data-youtube-video]')) {
      for (const attr of Array.from(wrapper.attributes)) {
        if (!['data-youtube-video', 'class'].includes(attr.name))
          wrapper.removeAttribute(attr.name);
      }
    }
  }
  return template.innerHTML;
}
