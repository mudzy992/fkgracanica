import {
  buildDocumentTitle,
  defaultShareImage,
  resolveSeoMeta,
  type ResolvedSeo,
} from '../../lib/seo-meta';

export interface SeoInput {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  siteName?: string;
  defaultDescription?: string;
  defaultImage?: string;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"][data-seo="1"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    el.setAttribute('data-seo', '1');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"][data-seo="1"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    el.setAttribute('data-seo', '1');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function applyResolved(meta: ResolvedSeo) {
  document.title = buildDocumentTitle(meta.title, meta.siteName);
  upsertCanonical(meta.url);

  upsertMeta('name', 'description', meta.description);
  upsertMeta('property', 'og:title', meta.title);
  upsertMeta('property', 'og:description', meta.description);
  upsertMeta('property', 'og:url', meta.url);
  upsertMeta('property', 'og:type', meta.type);
  upsertMeta('property', 'og:site_name', meta.siteName);
  upsertMeta('property', 'og:locale', 'bs_BA');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', meta.title);
  upsertMeta('name', 'twitter:description', meta.description);

  if (meta.image) {
    upsertMeta('property', 'og:image', meta.image);
    upsertMeta('property', 'og:image:secure_url', meta.image);
    upsertMeta('name', 'twitter:image', meta.image);
  }
}

export function applySeoToDocument(input: SeoInput) {
  const meta = resolveSeoMeta({
    title: input.title,
    description: input.description,
    image: input.image,
    url: input.url,
    type: input.type,
    siteName: input.siteName ?? 'FK Gračanica',
    defaultDescription: input.defaultDescription ?? 'Službena web stranica FK Gračanica.',
    defaultImage: defaultShareImage(input.defaultImage),
  });
  applyResolved(meta);
}
