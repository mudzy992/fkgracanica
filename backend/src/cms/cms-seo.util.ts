import { stripHtml, truncateMeta } from '../seo/seo-url.util';

type CmsSection = { widgetType: string; config: unknown };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Prvi rich-text blok stranice, skraćen za meta opis. */
export function cmsSeoDescFromSections(
  sections: CmsSection[],
): string | undefined {
  const rich = sections.find((s) => s.widgetType === 'rich-text');
  if (!rich || !isObject(rich.config)) return undefined;
  const html = typeof rich.config.html === 'string' ? rich.config.html : '';
  const text = stripHtml(html);
  return text ? truncateMeta(text) : undefined;
}
