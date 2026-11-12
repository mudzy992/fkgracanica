import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { CacheService } from '../cache/cache.module';
import { ImageRenditionService } from './image-rendition.service';
import {
  UPLOAD_QUOTA_TTL_SECONDS,
  assertUploadQuota,
  uploadQuotaKey,
} from './upload-quota.util';
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
    // BE-09/P-B09-3: `@Optional()` — bez Redisa (testovi, lokalno) kvota se
    // preskače; u produkciji CacheModule je `@Global` pa je uvijek prisutan.
    @Optional() private readonly cache?: CacheService,
  ) {}

  /**
   * BE-09/P-B09-3 (odobreno): dnevna kvota po korisniku (20/dan) uz throttling
   * na ruti (10/min). Kvota se troši samo na USPJEŠAN upload.
   */
  private async consumeQuota(userId?: string) {
    if (!userId || !this.cache) return;
    const count = await this.cache.incr(
      uploadQuotaKey(userId),
      UPLOAD_QUOTA_TTL_SECONDS,
    );
    assertUploadQuota(count);
  }

  async saveFile(
    file: Express.Multer.File,
    userId?: string,
  ): Promise<SavedFile> {
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

    await this.consumeQuota(userId);

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
