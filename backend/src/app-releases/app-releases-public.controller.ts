import { Controller, Get, NotFoundException, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AppReleasesService } from './app-releases.service';
import { apkDownloadFilename, streamApkFile } from './apk-download.util';

@ApiTags('public')
@Controller('public/app-releases')
export class AppReleasesPublicController {
  constructor(private readonly appReleases: AppReleasesService) {}

  @Get('android/latest/download')
  async downloadLatestAndroid(@Res() res: Response) {
    const file = await this.appReleases.resolveLatestAndroidDownload();
    if (!file) {
      res.status(404).json({ statusCode: 404, message: 'Nema objavljenog Android release-a.' });
      return;
    }
    streamApkFile(res, file.absPath, apkDownloadFilename(file.version), file.size);
  }

  @Get('android/latest')
  async latestAndroid() {
    const latest = await this.appReleases.findLatestAndroidPublic();
    if (!latest) throw new NotFoundException('Nema objavljenog Android release-a.');
    return latest;
  }
}
