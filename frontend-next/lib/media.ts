export type MediaVariant = 'thumb' | 'medium' | 'original';

function resolveVariantPath(path: string, variant: MediaVariant): string {
  if (variant === 'original') return path;
  if (!path.startsWith('originals/')) return path;
  const folder = variant === 'thumb' ? 'thumbs' : 'medium';
  return path.replace(/^originals\//, `${folder}/`).replace(/\.[^.]+$/, '.webp');
}

function getApiBase(): string {
  const raw =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000/api/v1';
  return raw.replace(/\/$/, '');
}

export function mediaUrl(
  path?: string | null,
  variant: MediaVariant = 'original',
): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = resolveVariantPath(
    path.replace(/^\.\//, '').replace(/^uploads\//, ''),
    variant,
  );
  const base = getApiBase();
  return `${base}/uploads/files/${normalized}`;
}

export function getApiUrl(): string {
  const raw =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000/api/v1';
  const base = raw.replace(/\/$/, '');
  return base.endsWith('/api/v1') ? base : `${base}/api/v1`;
}
