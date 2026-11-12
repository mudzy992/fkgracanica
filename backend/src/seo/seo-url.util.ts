/**
 * SEO/OG pomoćnici (BE-08).
 *
 * P-B08-1: nema `process.env` — bazni API URL se prosljeđuje iz `ConfigService`
 * (`configuration().apiPublicUrl`). Bez argumenta ponašanje je kao prije
 * (localhost default), pa vanjski pozivi ostaju kompatibilni.
 * P-B08-4: `normalizeSharePath` odbija apsolutne URL-ove (javna ruta
 * `/seo/share?path=` ne smije vratiti OG meta sa tuđim domenom).
 */
const FALLBACK_API = 'http://localhost:3000';

export function sitePublicUrl(apiPublicUrl?: string | null) {
  const api = (apiPublicUrl ?? '').trim() || FALLBACK_API;
  return (
    api.replace(/\/backend\/?$/, '').replace(/\/api\/v1\/?$/, '') ||
    'https://fkgracanica.ba'
  );
}

/** API osnova (bez završnog `/` i bez već prisutnog `/api/v1`) za linkove na API. */
export function apiPublicBase(apiPublicUrl?: string | null) {
  const api = ((apiPublicUrl ?? '').trim() || FALLBACK_API).replace(/\/+$/, '');
  return api.replace(/\/api\/v1$/, '');
}

export function absolutePageUrl(path = '/', apiPublicUrl?: string | null) {
  const base = sitePublicUrl(apiPublicUrl).replace(/\/$/, '');
  // Apsolutni URL se i dalje vraća kako je dat (kompatibilnost sa starim
  // ponašanjem); javna `/seo/share` ruta sama odbija strane domene.
  if (/^https?:\/\//i.test(path.trim())) return path.trim();
  const normalized = normalizeSharePath(path);
  return `${base}${normalized}`;
}

/** Javna (site-relativna) putanja — apsolutni URL-ovi se odbacuju. */
export function normalizeSharePath(raw?: unknown): string {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return '/';
  if (value.startsWith('//')) return '/';
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return '/';
  const withoutQuery = value.split('?')[0].split('#')[0];
  if (!withoutQuery) return '/';
  return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
}

export function mediaPublicUrl(
  path?: string | null,
  variant: 'thumb' | 'medium' | 'original' = 'medium',
  apiPublicUrl?: string | null,
) {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const apiBase = apiPublicBase(apiPublicUrl);
  let file = path.replace(/^\.\//, '').replace(/^uploads\//, '');
  if (variant !== 'original' && file.startsWith('originals/')) {
    const folder = variant === 'thumb' ? 'thumbs' : 'medium';
    file = file
      .replace(/^originals\//, `${folder}/`)
      .replace(/\.[^.]+$/, '.webp');
  }
  return `${apiBase}/api/v1/uploads/files/${file}`;
}

/** XML escape za sitemap (P-B08-5) — slug sa `&` inače kvari XML. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function stripHtml(text?: string | null) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateMeta(text: string, max = 160) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

export function buildDocumentTitle(title: string, siteName: string) {
  if (!title || title === siteName) return siteName;
  return `${title} | ${siteName}`;
}
