import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {}

  async saveFile(file: Express.Multer.File) {
    const uploadRoot = this.config.get<string>('UPLOAD_PATH', './uploads');
    const originalsDir = join(uploadRoot, 'originals');
    await mkdir(originalsDir, { recursive: true });
    const filename = `${randomUUID()}${extname(file.originalname)}`;
    const relativePath = join('originals', filename);
    const fullPath = join(uploadRoot, relativePath);
    await writeFile(fullPath, file.buffer);
    return {
      filename,
      path: relativePath.replace(/\\/g, '/'),
      urlPath: `/api/v1/uploads/files/${relativePath.replace(/\\/g, '/')}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
