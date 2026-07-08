import { mediaUrl } from './media';

const SITE_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : 'https://fkgracanica.ba';

export function siteOrigin() {
  return SITE_ORIGIN;
}

/** Apsolutni URL za canonical i OG (path može biti /vijesti/foo ili puni URL). */
export function absoluteUrl(path = '/') {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = siteOrigin().replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function buildDocumentTitle(title: string | undefined, siteName: string) {
  if (!title?.trim()) return siteName;
  if (title.trim() === siteName) return siteName;
  return `${title.trim()} | ${siteName}`;
}

export function defaultShareImage(crestPath?: string | null) {
  return mediaUrl(crestPath ?? undefined, 'medium') ?? mediaUrl(crestPath ?? undefined, 'original');
}

export function stripHtml(text?: string | null) {
  if (!text) return '';
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncateMeta(text: string, max = 160) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  image?: string;
  url: string;
  siteName: string;
  type: 'website' | 'article';
}

export function resolveSeoMeta(input: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  siteName: string;
  defaultDescription: string;
  defaultImage?: string;
}): ResolvedSeo {
  const siteName = input.siteName.trim() || 'FK Gračanica';
  const title = input.title?.trim() || siteName;
  const description = truncateMeta(
    stripHtml(input.description?.trim() || input.defaultDescription),
  );
  const image = input.image || input.defaultImage;
  const url = absoluteUrl(input.url ?? '/');
  return {
    title,
    description,
    image,
    url,
    siteName,
    type: input.type ?? 'website',
  };
}
