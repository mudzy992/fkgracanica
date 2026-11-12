import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { usePublicSettings } from '../../hooks';
import { defaultShareImage, stripHtml, truncateMeta } from '../../lib/seo-meta';
import { applySeoToDocument } from './seo-document';
import { buildArticleLd, buildSportsOrganizationLd } from './seo-json-ld';

export interface SeoInput {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedAt?: string | null;
  /**
   * FE-03/P-FE03-7: stranice koje ne smiju u indeks (payment bridge, prijava).
   * `robotsIndex` iz podešavanja važi za ostale stranice.
   */
  noindex?: boolean;
}

export function Seo({ title, description, image, url, type, publishedAt, noindex }: SeoInput) {
  const location = useLocation();
  const { data: settings } = usePublicSettings();

  const siteName =
    settings?.['club.name']?.trim() || settings?.['seo.title']?.trim() || 'FK Gračanica';
  const defaultDescription =
    settings?.['seo.description']?.trim() ||
    'Službena web stranica FK Gračanica — vijesti, utakmice, članstvo i ulaznice.';
  const defaultImage = defaultShareImage(settings?.['club.crestUrl']);
  const pageUrl = url ?? location.pathname + location.search;
  const isHome = location.pathname === '/';
  const robotsIndex = !noindex && settings?.['seo.robotsIndex'] !== 'false';
  const twitterHandle = settings?.['seo.twitterHandle'];

  const jsonLd = useMemo(() => {
    if (isHome) {
      return buildSportsOrganizationLd({
        name: siteName,
        crestUrl: defaultImage,
        siteUrl: '/',
      });
    }
    if (type === 'article' && title) {
      return buildArticleLd({
        headline: title,
        description: truncateMeta(stripHtml(description?.trim() || defaultDescription)),
        path: pageUrl.split('?')[0],
        image,
        datePublished: publishedAt,
      });
    }
    return undefined;
  }, [
    isHome,
    type,
    title,
    description,
    defaultDescription,
    pageUrl,
    image,
    publishedAt,
    siteName,
    defaultImage,
  ]);

  useEffect(() => {
    applySeoToDocument({
      title,
      description,
      image,
      url: pageUrl,
      type,
      siteName,
      defaultDescription,
      defaultImage,
      twitterHandle,
      robotsIndex,
      jsonLd,
    });
  }, [
    title,
    description,
    image,
    pageUrl,
    type,
    siteName,
    defaultDescription,
    defaultImage,
    twitterHandle,
    robotsIndex,
    jsonLd,
  ]);

  return null;
}
