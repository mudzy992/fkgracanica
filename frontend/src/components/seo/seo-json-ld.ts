import { absoluteUrl } from '../../lib/seo-meta';

export type JsonLd = Record<string, unknown>;

export function buildSportsOrganizationLd(input: {
  name: string;
  crestUrl?: string;
  siteUrl?: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: input.name,
    url: absoluteUrl(input.siteUrl ?? '/'),
    ...(input.crestUrl ? { logo: input.crestUrl } : {}),
  };
}

export function buildArticleLd(input: {
  headline: string;
  description: string;
  path: string;
  image?: string;
  datePublished?: string | null;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    url: absoluteUrl(input.path),
    ...(input.image ? { image: input.image } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
  };
}
