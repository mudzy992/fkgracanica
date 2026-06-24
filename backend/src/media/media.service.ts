import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { deleteStoredFiles } from './media-storage.util';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly uploadService: UploadService,
  ) {}

  findFolders() {
    return this.prisma.mediaFolder.findMany({
      include: { children: true, _count: { select: { assets: true } } },
      orderBy: { name: 'asc' },
    });
  }

  createFolder(name: string, parentId?: string) {
    return this.prisma.mediaFolder.create({ data: { name, parentId } });
  }

  updateFolder(id: string, data: { name?: string; parentId?: string | null }) {
    return this.prisma.mediaFolder.update({ where: { id }, data });
  }

  async removeFolder(id: string) {
    await this.prisma.mediaFolder.delete({ where: { id } });
    return { success: true };
  }

  findAssets(folderId?: string) {
    return this.prisma.mediaAsset.findMany({
      where: folderId ? { folderId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async uploadAsset(file: Express.Multer.File, folderId?: string) {
    const saved = await this.uploadService.saveFile(file);
    return this.createAsset({
      filename: saved.originalName,
      originalPath: saved.path,
      thumbPath: saved.thumbPath ?? undefined,
      mediumPath: saved.mediumPath ?? undefined,
      mimeType: saved.mimeType,
      size: saved.size,
      folderId,
    });
  }

  createAsset(data: {
    filename: string;
    originalPath: string;
    mimeType: string;
    size: number;
    folderId?: string;
    thumbPath?: string;
    mediumPath?: string;
    tags?: string;
  }) {
    return this.prisma.mediaAsset.create({ data });
  }

  async updateAsset(id: string, data: Record<string, unknown>) {
    await this.ensureAsset(id);
    return this.prisma.mediaAsset.update({ where: { id }, data });
  }

  async removeAsset(id: string) {
    const asset = await this.ensureAsset(id);
    const uploadRoot = this.config.get<string>('UPLOAD_PATH', './uploads');
    await deleteStoredFiles(uploadRoot, [asset.originalPath, asset.thumbPath, asset.mediumPath]);
    return this.prisma.mediaAsset.delete({ where: { id } });
  }

  private async ensureAsset(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset nije pronađen');
    return asset;
  }
}
