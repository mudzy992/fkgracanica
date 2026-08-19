import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PublicAnalyticsModule } from '../public-analytics/public-analytics.module';

@Module({
  imports: [PublicAnalyticsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
