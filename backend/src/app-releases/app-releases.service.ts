import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppReleasePlatform, AppReleaseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicUrl } from '../upload/upload.util';
import { resolveApkAbsPath } from './apk-download.util';
import { CreateAppReleaseDto } from './dto/create-app-release.dto';
import { UpdateAppReleaseDto } from './dto/update-app-release.dto';

const APK_MIMES = new Set([
  'application/vnd.android.package-archive',
  'application/octet-stream',
]);

@Injectable()
export class AppReleasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async saveApk(file: Express.Multer.File) {
    this.assertApkFile(file);
    const uploadRoot = this.config.get<string>('UPLOAD_PATH', './uploads');
    const now = new Date();
    const relDir = path.join('app-releases', String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0'));
    await fs.mkdir(path.join(uploadRoot, relDir), { recursive: true });
    const relPath = path.join(relDir, `app-${Date.now()}.apk`).replace(/\\/g, '/');
    await fs.writeFile(path.join(uploadRoot, relPath), file.buffer);
    return {
      apkPath: relPath,
      apkSha256: createHash('sha256').update(file.buffer).digest('hex'),
      apkSizeBytes: file.size,
    };
  }

  async create(dto: CreateAppReleaseDto, createdById: string) {
    const release = await this.prisma.appRelease.create({
      data: {
        platform: AppReleasePlatform.ANDROID,
        version: dto.version.trim(),
        versionCode: dto.versionCode,
        minSupportedVersionCode: dto.minSupportedVersionCode,
        forceUpdate: dto.forceUpdate ?? false,
        apkPath: dto.apkPath,
        apkSha256: dto.apkSha256.toLowerCase(),
        apkSizeBytes: dto.apkSizeBytes,
        releaseNotes: dto.releaseNotes?.trim() || null,
        status: AppReleaseStatus.DRAFT,
        createdById,
      },
    });
    if (dto.publish) return this.publish(release.id);
    return release;
  }

  findAllAdmin() {
    return this.prisma.appRelease.findMany({
      orderBy: [{ versionCode: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async update(id: string, dto: UpdateAppReleaseDto) {
    const existing = await this.requireById(id);
    if (dto.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      return this.publish(id, dto);
    }
    return this.prisma.appRelease.update({
      where: { id },
      data: {
        releaseNotes: dto.releaseNotes !== undefined ? dto.releaseNotes.trim() || null : undefined,
        forceUpdate: dto.forceUpdate,
        minSupportedVersionCode: dto.minSupportedVersionCode,
        status: dto.status as AppReleaseStatus | undefined,
      },
    });
  }

  async publish(id: string, patch?: UpdateAppReleaseDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.appRelease.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Release nije pronađen.');
      await tx.appRelease.updateMany({
        where: { platform: existing.platform, status: AppReleaseStatus.PUBLISHED, id: { not: id } },
        data: { status: AppReleaseStatus.RETIRED },
      });
      return tx.appRelease.update({
        where: { id },
        data: {
          status: AppReleaseStatus.PUBLISHED,
          publishedAt: existing.publishedAt ?? new Date(),
          releaseNotes: patch?.releaseNotes !== undefined ? patch.releaseNotes.trim() || null : undefined,
          forceUpdate: patch?.forceUpdate,
          minSupportedVersionCode: patch?.minSupportedVersionCode,
        },
      });
    });
  }

  async findLatestAndroidPublic() {
    const latest = await this.prisma.appRelease.findFirst({
      where: { platform: AppReleasePlatform.ANDROID, status: AppReleaseStatus.PUBLISHED },
      orderBy: { versionCode: 'desc' },
    });
    if (!latest) return null;
    return {
      version: latest.version,
      versionCode: latest.versionCode,
      minSupportedVersionCode: latest.minSupportedVersionCode,
      forceUpdate: latest.forceUpdate,
      apkUrl: toPublicUrl(latest.apkPath),
      apkSha256: latest.apkSha256,
      apkSizeBytes: latest.apkSizeBytes,
      releaseNotes: latest.releaseNotes,
      publishedAt: latest.publishedAt?.toISOString() ?? null,
    };
  }

  async resolveLatestAndroidDownload() {
    const latest = await this.prisma.appRelease.findFirst({
      where: { platform: AppReleasePlatform.ANDROID, status: AppReleaseStatus.PUBLISHED },
      orderBy: { versionCode: 'desc' },
    });
    if (!latest) return null;
    const uploadRoot = this.config.get<string>('UPLOAD_PATH', './uploads');
    const absPath = resolveApkAbsPath(uploadRoot, latest.apkPath);
    if (!absPath) return null;
    try {
      const st = await fs.stat(absPath);
      if (!st.isFile()) return null;
      return { version: latest.version, absPath, size: st.size };
    } catch {
      return null;
    }
  }

  private async requireById(id: string) {
    const row = await this.prisma.appRelease.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Release nije pronađen.');
    return row;
  }

  private assertApkFile(file: Express.Multer.File): void {
    if (!file?.buffer?.length) throw new BadRequestException('Nijedna datoteka nije poslata.');
    const name = (file.originalname || '').toLowerCase();
    if (!name.endsWith('.apk') || !APK_MIMES.has(file.mimetype)) {
      throw new BadRequestException('Dozvoljen je samo APK fajl.');
    }
  }
}
