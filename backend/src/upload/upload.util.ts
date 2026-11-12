export const RENDITION_SIZES = {
  thumb: 200,
  medium: 800,
} as const;

export type RenditionVariant = keyof typeof RENDITION_SIZES;

/**
 * BE-09b/P-B09b-11: allowlist tačnih tipova umjesto `startsWith('image/') &&
 * !includes('svg')` (heuristika je propuštala egzotične tipove i odbijala
 * legitimne koji sadrže "svg" u parametru). SVG je namjerno isključen (XSS).
 */
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
] as const;

export function isImageMime(mimeType: string): boolean {
  return (ALLOWED_IMAGE_MIMES as readonly string[]).includes(
    mimeType.toLowerCase().trim(),
  );
}

export function toPublicUrl(relativePath: string): string {
  return `/api/v1/uploads/files/${relativePath.replace(/\\/g, '/')}`;
}

export function variantPath(
  originalPath: string,
  variant: RenditionVariant,
): string {
  const folder = variant === 'thumb' ? 'thumbs' : 'medium';
  const basename = originalPath
    .replace(/^originals\//, '')
    .replace(/\.[^.]+$/, '.webp');
  return `${folder}/${basename}`;
}
