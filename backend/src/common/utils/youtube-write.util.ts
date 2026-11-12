import { BadRequestException } from '@nestjs/common';
import { parseYouTubeId } from './youtube.util';

/** Optional YouTube fields can be explicitly cleared, but not set to an unsafe URL. */
export function optionalYouTubeUrl(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== 'string')
    throw new BadRequestException('Unesite ispravan YouTube URL');
  const url = value.trim();
  if (!url) return null;
  if (!parseYouTubeId(url))
    throw new BadRequestException('Unesite ispravan YouTube URL');
  return url;
}
