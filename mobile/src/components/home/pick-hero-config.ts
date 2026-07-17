import type { CmsPage } from '../../types/api';

export type HomeHeroConfig = {
  title?: string;
  subtitle?: string;
  foundedYear?: string;
  backgroundImage?: string;
};

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

export function pickHeroConfig(page: CmsPage | null): HomeHeroConfig | null {
  const hero = page?.sections?.find((section) => section.enabled && section.widgetType === 'hero');
  if (!hero) return null;
  return {
    title: getString(hero.config.title),
    subtitle: getString(hero.config.subtitle),
    foundedYear: getString(hero.config.foundedYear),
    backgroundImage: getString(hero.config.backgroundImage),
  };
}
