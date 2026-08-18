import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppReleasesService } from './app-releases.service';

@ApiTags('public')
@Controller('public/app-releases')
export class AppReleasesPublicController {
  constructor(private readonly appReleases: AppReleasesService) {}

  @Get('android/latest')
  async latestAndroid() {
    const latest = await this.appReleases.findLatestAndroidPublic();
    if (!latest) throw new NotFoundException('Nema objavljenog Android release-a.');
    return latest;
  }
}
