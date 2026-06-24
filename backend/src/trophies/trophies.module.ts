import { Module } from '@nestjs/common';
import { TrophiesService } from './trophies.service';
import { TrophiesController } from './trophies.controller';

@Module({ controllers: [TrophiesController], providers: [TrophiesService], exports: [TrophiesService] })
export class TrophiesModule {}
