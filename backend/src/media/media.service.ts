import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { paginate, parsePagination } from '../common/utils/pagination.util';
import type { MediaAssetQueryDto } from './dto/media-asset-query.dto';
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
    const folder = await this.prisma.mediaFolder.findUnique({
      where: { id },
      include: { _count: { select: { assets: true, children: true } } },
    });
    if (!folder) throw new NotFoundException('Mapa nije pronađena');
    if (folder._count.assets > 0 || folder._count.children > 0) {
      throw new NotFoundException('Mapa nije prazna');
    }
    await this.prisma.mediaFolder.delete({ where: { id } });
    return { success: true };
  }

  async findAssets(query: MediaAssetQueryDto) {
    const params = parsePagination(query);
    const where: Prisma.MediaAssetWhereInput = {};
    if (query.folderId) where.folderId = query.folderId;
    if (params.search) {
      where.OR = [
        { filename: { contains: params.search } },
        { tags: { contains: params.search } },
        { originalPath: { contains: params.search } },
      ];
    }
    return paginate(
      params,
      (skip, take) =>
        this.prisma.mediaAsset.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
      () => this.prisma.mediaAsset.count({ where }),
    );
  }

  async findAsset(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset nije pronađen');
    return asset;
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

  async replaceAsset(id: string, file: Express.Multer.File) {
    const asset = await this.ensureAsset(id);
    const uploadRoot = this.config.get<string>('UPLOAD_PATH', './uploads');
    await deleteStoredFiles(uploadRoot, [asset.originalPath, asset.thumbPath, asset.mediumPath]);
    const saved = await this.uploadService.saveFile(file);
    return this.prisma.mediaAsset.update({
      where: { id },
      data: {
        filename: saved.originalName,
        originalPath: saved.path,
        thumbPath: saved.thumbPath ?? null,
        mediumPath: saved.mediumPath ?? null,
        mimeType: saved.mimeType,
        size: saved.size,
      },
    });
  }

  private async ensureAsset(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset nije pronađen');
    return asset;
  }
}
