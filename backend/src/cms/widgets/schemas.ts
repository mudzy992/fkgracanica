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

export const widgetMeta: Record<
  WidgetType,
  { label: string; category: string }
> = {
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

type FieldType = 'string' | 'number' | 'boolean' | 'array';

/**
 * BE-09b/P-B09b-6: minimalna pravila po tipu widgeta (prije se validiralo
 * samo `hero.title` i `footer-about.text`, pa je npr. `news-feed.limit: "x"`
 * prolazio i pravio grešku pri renderu).
 */
const WIDGET_FIELDS: Partial<Record<WidgetType, Record<string, FieldType>>> = {
  hero: { title: 'string', subtitle: 'string', backgroundImage: 'string' },
  'news-feed': { limit: 'number', title: 'string', mode: 'string' },
  gallery: { limit: 'number', title: 'string', mode: 'string' },
  sponsors: { limit: 'number', title: 'string' },
  'next-match': { title: 'string', backgroundImage: 'string' },
  'last-result': { title: 'string' },
  'league-table': { title: 'string' },
  'featured-players': { limit: 'number', title: 'string' },
  'membership-cta': { title: 'string', text: 'string' },
  'tickets-cta': { title: 'string', text: 'string' },
  trophies: { limit: 'number', title: 'string' },
  newsletter: { title: 'string', description: 'string' },
  'rich-text': { html: 'string' },
  'custom-html': { html: 'string' },
  'cta-band': { title: 'string', text: 'string' },
  'footer-about': { text: 'string' },
};

function isFieldType(value: unknown, expected: FieldType): boolean {
  if (expected === 'array') return Array.isArray(value);
  return typeof value === expected;
}

export function validateWidgetConfig(type: string, config: unknown) {
  if (!WIDGET_TYPES.includes(type as WidgetType)) {
    return { ok: false as const, error: `Nepoznat widget: ${type}` };
  }
  // BE-09b/P-B09b-6: ne-objekat se više ne pretvara tiho u `{}` (podaci su se
  // gubili bez greške) — klijent dobija 400 sa jasnom porukom.
  if (config !== undefined && config !== null && !isObject(config)) {
    return {
      ok: false as const,
      error: 'Konfiguracija widgeta mora biti objekat',
    };
  }
  const data = isObject(config) ? config : {};
  if (type === 'hero' && typeof data.title === 'string' && !data.title.trim()) {
    return { ok: false as const, error: 'Naslov je obavezan' };
  }
  if (
    type === 'footer-about' &&
    typeof data.text === 'string' &&
    !data.text.trim()
  ) {
    return { ok: false as const, error: 'Tekst je obavezan' };
  }
  const fields = WIDGET_FIELDS[type as WidgetType];
  if (fields) {
    for (const [key, expected] of Object.entries(fields)) {
      if (data[key] === undefined || data[key] === null) continue;
      if (!isFieldType(data[key], expected)) {
        return {
          ok: false as const,
          error: `Polje "${key}" mora biti ${expected === 'array' ? 'lista' : expected === 'number' ? 'broj' : expected === 'boolean' ? 'true/false' : 'tekst'}`,
        };
      }
    }
  }
  return { ok: true as const, data };
}
