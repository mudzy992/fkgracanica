export const RENDITION_SIZES = {
  thumb: 200,
  medium: 800,
} as const;

export type RenditionVariant = keyof typeof RENDITION_SIZES;

export function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith('image/') && !mimeType.includes('svg');
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
