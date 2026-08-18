export const WIDGET_TYPES = [
  'hero',
  'news-feed',
  'gallery',
  'sponsors',
  'next-match',
  'last-result',
  'league-table',
  'featured-players',
  'membership-cta',
  'tickets-cta',
  'trophies',
  'newsletter',
  'rich-text',
  'custom-html',
  'cta-band',
  'club-about-cta',
  'footer-about',
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

export const widgetMeta: Record<WidgetType, { label: string; category: string }> = {
  hero: { label: 'Hero baner', category: 'layout' },
  'rich-text': { label: 'Tekst blok', category: 'layout' },
  'custom-html': { label: 'Custom HTML', category: 'layout' },
  'cta-band': { label: 'Poziv na akciju', category: 'layout' },
  'club-about-cta': { label: 'CTA O klubu i baština', category: 'layout' },
  'news-feed': { label: 'Vijesti', category: 'module' },
  gallery: { label: 'Galerija', category: 'module' },
  sponsors: { label: 'Sponzori', category: 'module' },
  'next-match': { label: 'Sljedeća utakmica', category: 'module' },
  'last-result': { label: 'Zadnji rezultat', category: 'module' },
  'league-table': { label: 'Tabela lige', category: 'module' },
  'featured-players': { label: 'Istaknuti igrači', category: 'module' },
  'membership-cta': { label: 'Članstvo', category: 'module' },
  'tickets-cta': { label: 'Ulaznice', category: 'module' },
  trophies: { label: 'Trofeji', category: 'module' },
  newsletter: { label: 'Newsletter', category: 'module' },
  'footer-about': { label: 'Footer o klubu', category: 'global' },
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function validateWidgetConfig(type: string, config: unknown) {
  if (!WIDGET_TYPES.includes(type as WidgetType)) {
    return { ok: false as const, error: `Nepoznat widget: ${type}` };
  }
  const data = isObject(config) ? config : {};
  if (type === 'hero' && typeof data.title === 'string' && !data.title.trim()) {
    return { ok: false as const, error: 'Naslov je obavezan' };
  }
  if (type === 'footer-about' && typeof data.text === 'string' && !data.text.trim()) {
    return { ok: false as const, error: 'Tekst je obavezan' };
  }
  return { ok: true as const, data };
}
