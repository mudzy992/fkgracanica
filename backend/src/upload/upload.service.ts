import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { ImageRenditionService } from './image-rendition.service';
import { isImageMime, toPublicUrl } from './upload.util';

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
    const uploadRoot = this.config.get<string>('UPLOAD_PATH', './uploads');
    const id = randomUUID();
    const ext = extname(file.originalname).toLowerCase() || '.bin';
    const filename = `${id}${ext}`;
    const relativePath = join('originals', filename).replace(/\\/g, '/');

    await mkdir(join(uploadRoot, 'originals'), { recursive: true });
    await writeFile(join(uploadRoot, relativePath), file.buffer);

    let thumbPath: string | null = null;
    let mediumPath: string | null = null;
    if (isImageMime(file.mimetype)) {
      const generated = await this.renditions.generate(
        file.buffer,
        relativePath,
        uploadRoot,
      );
      thumbPath = generated.thumbPath;
      mediumPath = generated.mediumPath;
    }

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
