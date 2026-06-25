import { z } from 'zod';

export const homeHeroSchema = z.object({
  foundedYear: z.string().optional(),
  title: z.string().min(1, 'Naslov je obavezan'),
  subtitle: z.string().optional(),
  primaryCtaPath: z.string().optional(),
  secondaryCtaPath: z.string().optional(),
});

export const footerAboutSchema = z.object({
  text: z.string().min(1, 'Tekst je obavezan'),
});

export const cmsSchemas: Record<string, z.ZodType<Record<string, unknown>>> = {
  'home.hero': homeHeroSchema,
  'footer.about': footerAboutSchema,
};

export function validateCmsContent(key: string, content: unknown) {
  const schema = cmsSchemas[key];
  if (!schema) return { ok: true as const, data: content as Record<string, unknown> };
  const parsed = schema.safeParse(content);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Neispravan sadržaj' };
  }
  return { ok: true as const, data: parsed.data };
}
