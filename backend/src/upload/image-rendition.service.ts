import { BadRequestException, Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import {
  RENDITION_SIZES,
  variantPath,
  type RenditionVariant,
} from './upload.util';

export interface RenditionResult {
  thumbPath: string | null;
  mediumPath: string | null;
}

@Injectable()
export class ImageRenditionService {
  /**
   * BE-09b/P-B09b-10: `mkdir` je van petlje (idempotentan, ali se ponavljao za
   * svaku varijantu), a pri padu `sharp`-a (oštećena ili „bomb” slika) se
   * već upisane varijante brišu i klijent dobija **400** umjesto 500.
   */
  async generate(
    buffer: Buffer,
    originalPath: string,
    uploadRoot: string,
  ): Promise<RenditionResult> {
    const results: Partial<Record<RenditionVariant, string>> = {};
    const written: string[] = [];
    const variants = Object.keys(RENDITION_SIZES) as RenditionVariant[];

    await Promise.all([
      mkdir(join(uploadRoot, 'thumbs'), { recursive: true }),
      mkdir(join(uploadRoot, 'medium'), { recursive: true }),
    ]);

    try {
      for (const variant of variants) {
        const relative = variantPath(originalPath, variant);
        const fullPath = join(uploadRoot, relative);

        const resized = await sharp(buffer)
          .rotate()
          .resize({
            width: RENDITION_SIZES[variant],
            withoutEnlargement: true,
          })
          .webp({ quality: variant === 'thumb' ? 75 : 82 })
          .toBuffer();

        await writeFile(fullPath, resized);
        written.push(fullPath);
        results[variant] = relative.replace(/\\/g, '/');
      }
    } catch (error) {
      await Promise.all(written.map((path) => unlink(path).catch(() => null)));
      throw new BadRequestException(
        `Slika nije podržana ili je oštećena: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return {
      thumbPath: results.thumb ?? null,
      mediumPath: results.medium ?? null,
    };
  }
}
