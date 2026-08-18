import { Module } from '@nestjs/common';
import { AppReleasesController } from './app-releases.controller';
import { AppReleasesPublicController } from './app-releases-public.controller';
import { AppReleasesService } from './app-releases.service';

@Module({
  controllers: [AppReleasesController, AppReleasesPublicController],
  providers: [AppReleasesService],
})
export class AppReleasesModule {}
