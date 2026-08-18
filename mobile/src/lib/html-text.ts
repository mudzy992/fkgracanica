const BASIC_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export function stripHtml(html: string): string {
  if (!html) return '';
  let text = html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*p\s*>/gi, '\n')
    .replace(/<\s*p[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '');
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
      if (entity[0] === '#') {
        const code =
          entity[1] === 'x' || entity[1] === 'X'
            ? parseInt(entity.slice(2), 16)
            : Number(entity.slice(1));
        return Number.isFinite(code) ? String.fromCharCode(code) : '';
      }
      return BASIC_ENTITIES[entity.toLowerCase()] ?? '';
    });
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

export function htmlToParagraphs(html: string): string[] {
  return stripHtml(html)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}
