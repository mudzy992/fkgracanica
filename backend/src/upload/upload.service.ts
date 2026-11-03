import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { ImageRenditionService } from './image-rendition.service';
import { isImageMime, toPublicUrl } from './upload.util';

/**
 * BE-04/P-B04-2 (odobreno): allowlist ekstenzija — uz `isImageMime`
 * (image/* bez SVG-a) zatvara stored XSS (upload .html/.svg na javnu
 * static rutu `/api/v1/uploads/files/`).
 */
const ALLOWED_IMAGE_EXTS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
  '.gif',
]);

export interface SavedFile {
  filename: string;
  path: string;
  thumbPath: string | null;
  mediumPath: string | null;
  urlPath: string;
  thumbUrlPath: string | null;
  mediumUrlPath: string | null;
  originalName: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class UploadService {
  constructor(
    private readonly config: ConfigService,
    private readonly renditions: ImageRenditionService,
  ) {}

  async saveFile(file: Express.Multer.File): Promise<SavedFile> {
    // BE-04/P-B04-2: validacija PRIJE bilo kakvog upisa na disk.
    if (!file) {
      throw new BadRequestException('Nedostaje fajl');
    }
    const ext = extname(file.originalname).toLowerCase();
    if (!isImageMime(file.mimetype) || !ALLOWED_IMAGE_EXTS.has(ext)) {
      throw new BadRequestException(
        'Dozvoljene su samo slike (jpg, jpeg, png, webp, avif, gif)',
      );
    }

    const uploadRoot = this.config.get<string>('uploadPath') ?? './uploads';
    const id = randomUUID();
    const filename = `${id}${ext}`;
    const relativePath = join('originals', filename).replace(/\\/g, '/');

    await mkdir(join(uploadRoot, 'originals'), { recursive: true });
    await writeFile(join(uploadRoot, relativePath), file.buffer);

    // BE-09b/P-B09b-10: rendicije se generišu uvijek (validacija iznad je već
    // garantirala sliku) i bez „mrtve” grane. Ako generisanje padne, original
    // se briše — prije je ostajao kao siroče na disku.
    const generated = await this.renditions
      .generate(file.buffer, relativePath, uploadRoot)
      .catch(async (error: unknown) => {
        await unlink(join(uploadRoot, relativePath)).catch(() => undefined);
        throw error;
      });
    const thumbPath = generated.thumbPath;
    const mediumPath = generated.mediumPath;

    return {
      filename,
      path: relativePath,
      thumbPath,
      mediumPath,
      urlPath: toPublicUrl(relativePath),
      thumbUrlPath: thumbPath ? toPublicUrl(thumbPath) : null,
      mediumUrlPath: mediumPath ? toPublicUrl(mediumPath) : null,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
