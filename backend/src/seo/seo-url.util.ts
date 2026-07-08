export function sitePublicUrl() {
  const api = process.env.API_PUBLIC_URL ?? 'http://localhost:3000';
  return api.replace(/\/backend\/?$/, '').replace(/\/api\/v1\/?$/, '') || 'https://fkgracanica.ba';
}

export function absolutePageUrl(path = '/') {
  const base = sitePublicUrl().replace(/\/$/, '');
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function mediaPublicUrl(path?: string | null, variant: 'thumb' | 'medium' | 'original' = 'medium') {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const apiBase = (process.env.API_PUBLIC_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  let file = path.replace(/^\.\//, '').replace(/^uploads\//, '');
  if (variant !== 'original' && file.startsWith('originals/')) {
    const folder = variant === 'thumb' ? 'thumbs' : 'medium';
    file = file.replace(/^originals\//, `${folder}/`).replace(/\.[^.]+$/, '.webp');
  }
  return `${apiBase}/api/v1/uploads/files/${file}`;
}

export function stripHtml(text?: string | null) {
  if (!text) return '';
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncateMeta(text: string, max = 160) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

export function buildDocumentTitle(title: string, siteName: string) {
  if (!title || title === siteName) return siteName;
  return `${title} | ${siteName}`;
}
