import * as fs from 'fs/promises';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppReleasePlatform, AppReleaseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicUrl } from '../upload/upload.util';
import { resolveApkAbsPath } from './apk-download.util';
import {
  removeFileQuietly,
  storeApk,
  type StoredApk,
} from './apk-storage.util';
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

  /** BE-08/P-B08-3: upis na disk bez 200 MB u RAM-u (vidi `apk-storage.util`). */
  async saveApk(file: Express.Multer.File): Promise<StoredApk> {
    this.assertApkFile(file);
    return storeApk(this.uploadRoot(), file);
  }

  /** BE-08/P-B08-1: tipizirani `uploadPath` (bez sirovog `UPLOAD_PATH`). */
  private uploadRoot(): string {
    return this.config.get<string>('uploadPath') ?? './uploads';
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
        releaseNotes:
          dto.releaseNotes !== undefined
            ? dto.releaseNotes.trim() || null
            : undefined,
        forceUpdate: dto.forceUpdate,
        minSupportedVersionCode: dto.minSupportedVersionCode,
        status: dto.status,
      },
    });
  }

  async publish(id: string, patch?: UpdateAppReleaseDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.appRelease.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Release nije pronađen.');
      await tx.appRelease.updateMany({
        where: {
          platform: existing.platform,
          status: AppReleaseStatus.PUBLISHED,
          id: { not: id },
        },
        data: { status: AppReleaseStatus.RETIRED },
      });
      return tx.appRelease.update({
        where: { id },
        data: {
          status: AppReleaseStatus.PUBLISHED,
          publishedAt: existing.publishedAt ?? new Date(),
          releaseNotes:
            patch?.releaseNotes !== undefined
              ? patch.releaseNotes.trim() || null
              : undefined,
          forceUpdate: patch?.forceUpdate,
          minSupportedVersionCode: patch?.minSupportedVersionCode,
        },
      });
    });
  }

  async findLatestAndroidPublic() {
    const latest = await this.prisma.appRelease.findFirst({
      where: {
        platform: AppReleasePlatform.ANDROID,
        status: AppReleaseStatus.PUBLISHED,
      },
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
      where: {
        platform: AppReleasePlatform.ANDROID,
        status: AppReleaseStatus.PUBLISHED,
      },
      orderBy: { versionCode: 'desc' },
    });
    if (!latest) return null;
    const absPath = resolveApkAbsPath(this.uploadRoot(), latest.apkPath);
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
    if (!file || (!file.buffer?.length && !file.path)) {
      throw new BadRequestException('Nijedna datoteka nije poslata.');
    }
    const name = (file.originalname || '').toLowerCase();
    if (!name.endsWith('.apk') || !APK_MIMES.has(file.mimetype)) {
      void removeFileQuietly(file.path);
      throw new BadRequestException('Dozvoljen je samo APK fajl.');
    }
  }
}
