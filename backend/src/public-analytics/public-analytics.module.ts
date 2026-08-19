import { Module } from '@nestjs/common';
import { PublicAnalyticsService } from './public-analytics.service';
import { PublicAnalyticsController } from './public-analytics.controller';

@Module({ controllers: [PublicAnalyticsController], providers: [PublicAnalyticsService], exports: [PublicAnalyticsService] })
export class PublicAnalyticsModule {}
