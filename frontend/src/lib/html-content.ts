/** Dekodira HTML entitete ako je sadržaj dvostruko escapovan. */
export function normalizeHtmlForRender(html: string): string {
  const trimmed = html?.trim() ?? '';
  if (!trimmed) return '';
  if (trimmed.includes('&lt;') && /&lt;\/?[a-z]/i.test(trimmed)) {
    const doc = new DOMParser().parseFromString(trimmed, 'text/html');
    return doc.documentElement.textContent ?? trimmed;
  }
  return trimmed;
}

export function stripHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(normalizeHtmlForRender(html), 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}
