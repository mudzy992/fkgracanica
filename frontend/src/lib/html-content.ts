/** Parse text without letting a stored iframe fetch its source, even in detached documents. */
function textDocument(html: string): Document {
  const template = document.createElement('template');
  template.innerHTML = html;
  for (const frame of template.content.querySelectorAll('iframe')) {
    frame.replaceWith(document.createTextNode(frame.textContent ?? ''));
  }
  return new DOMParser().parseFromString(template.innerHTML, 'text/html');
}

/** Dekodira HTML entitete ako je sadržaj dvostruko escapovan. */
export function normalizeHtmlForRender(html: string): string {
  const trimmed = html?.trim() ?? '';
  if (!trimmed) return '';
  if (trimmed.includes('&lt;') && /&lt;\/?[a-z]/i.test(trimmed)) {
    const doc = textDocument(trimmed);
    return doc.documentElement.textContent ?? trimmed;
  }
  return trimmed;
}

export function stripHtml(html: string): string {
  if (!html) return '';
  const doc = textDocument(normalizeHtmlForRender(html));
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}
