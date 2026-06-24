const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export type MediaVariant = 'thumb' | 'medium' | 'original';

function resolveVariantPath(path: string, variant: MediaVariant): string {
  if (variant === 'original') return path;
  if (!path.startsWith('originals/')) return path;
  const folder = variant === 'thumb' ? 'thumbs' : 'medium';
  return path.replace(/^originals\//, `${folder}/`).replace(/\.[^.]+$/, '.webp');
}

export function mediaUrl(path?: string | null, variant: MediaVariant = 'original'): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = resolveVariantPath(
    path.replace(/^\.\//, '').replace(/^uploads\//, ''),
    variant,
  );
  const base = API_URL.replace(/\/$/, '');
  return `${base}/uploads/files/${normalized}`;
}
