import { z } from 'zod';

const ctaButton = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  variant: z.enum(['primary', 'outline']).optional(),
});

export const widgetSchemas = {
  hero: z.object({
    foundedYear: z.string().optional(),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    backgroundImage: z.string().optional(),
    buttons: z.array(ctaButton).default([]),
  }),
  'news-feed': z.object({
    title: z.string().optional(),
    mode: z.enum(['latest', 'featured']).default('latest'),
    limit: z.number().int().min(1).max(12).default(3),
    categoryId: z.string().optional(),
    viewAllUrl: z.string().optional(),
    viewAllLabel: z.string().optional(),
  }),
  gallery: z.object({
    title: z.string().optional(),
    mode: z.enum(['latest', 'single']).default('latest'),
    galleryId: z.string().optional(),
    limit: z.number().int().min(1).max(12).default(4),
    viewAllUrl: z.string().optional(),
    viewAllLabel: z.string().optional(),
  }),
  sponsors: z.object({
    title: z.string().optional(),
    limit: z.number().int().min(1).max(24).default(6),
    viewAllUrl: z.string().optional(),
    viewAllLabel: z.string().optional(),
  }),
  'next-match': z.object({ title: z.string().optional() }),
  'last-result': z.object({ title: z.string().optional() }),
  'league-table': z.object({ title: z.string().optional() }),
  'featured-players': z.object({
    title: z.string().optional(),
    limit: z.number().int().min(1).max(12).default(4),
    viewAllUrl: z.string().optional(),
  }),
  'membership-cta': z.object({
    title: z.string().optional(),
    text: z.string().optional(),
    buttonLabel: z.string().optional(),
    buttonUrl: z.string().optional(),
  }),
  'tickets-cta': z.object({
    title: z.string().optional(),
    text: z.string().optional(),
    buttonLabel: z.string().optional(),
    buttonUrl: z.string().optional(),
  }),
  trophies: z.object({
    title: z.string().optional(),
    limit: z.number().int().min(1).max(12).default(6),
    viewAllUrl: z.string().optional(),
  }),
  newsletter: z.object({ title: z.string().optional(), description: z.string().optional() }),
  'rich-text': z.object({ html: z.string().default('') }),
  'custom-html': z.object({ html: z.string().default('') }),
  'cta-band': z.object({
    title: z.string().optional(),
    text: z.string().optional(),
    buttons: z.array(ctaButton).default([]),
  }),
  'footer-about': z.object({ text: z.string().min(1) }),
} as const;

export type WidgetType = keyof typeof widgetSchemas;

export type WidgetConfigMap = {
  [K in WidgetType]: z.infer<(typeof widgetSchemas)[K]>;
};

export const widgetMeta: Record<WidgetType, { label: string; category: string }> = {
  hero: { label: 'Hero baner', category: 'layout' },
  'rich-text': { label: 'Tekst blok', category: 'layout' },
  'custom-html': { label: 'Custom HTML', category: 'layout' },
  'cta-band': { label: 'Poziv na akciju', category: 'layout' },
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

export function validateWidgetConfig(type: string, config: unknown) {
  const schema = widgetSchemas[type as WidgetType];
  if (!schema) return { ok: false as const, error: `Nepoznat widget: ${type}` };
  const parsed = schema.safeParse(config ?? {});
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Neispravan config' };
  }
  return { ok: true as const, data: parsed.data };
}
