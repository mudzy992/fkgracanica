import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { RENDITION_SIZES, variantPath, type RenditionVariant } from './upload.util';

export interface RenditionResult {
  thumbPath: string | null;
  mediumPath: string | null;
}

@Injectable()
export class ImageRenditionService {
  async generate(buffer: Buffer, originalPath: string, uploadRoot: string): Promise<RenditionResult> {
    const results: Partial<Record<RenditionVariant, string>> = {};

    for (const variant of Object.keys(RENDITION_SIZES) as RenditionVariant[]) {
      const relative = variantPath(originalPath, variant);
      const fullPath = join(uploadRoot, relative);
      await mkdir(join(uploadRoot, variant === 'thumb' ? 'thumbs' : 'medium'), { recursive: true });

      const resized = await sharp(buffer)
        .rotate()
        .resize({ width: RENDITION_SIZES[variant], withoutEnlargement: true })
        .webp({ quality: variant === 'thumb' ? 75 : 82 })
        .toBuffer();

      await writeFile(fullPath, resized);
      results[variant] = relative.replace(/\\/g, '/');
    }

    return {
      thumbPath: results.thumb ?? null,
      mediumPath: results.medium ?? null,
    };
  }
}
