import { Module, forwardRef } from '@nestjs/common';
import { LiveService } from './live.service';
import { LiveClockOpsService } from './live-clock-ops.service';
import { LivePhaseService } from './live-phase.service';
import { LiveController } from './live.controller';
import { RealtimeModule } from '../realtime/realtime.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { LiveReportService } from './live-report.service';
import { LiveReportController } from './live-report.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => RealtimeModule), StatisticsModule, NotificationsModule],
  controllers: [LiveController, LiveReportController],
  providers: [LiveService, LiveClockOpsService, LivePhaseService, LiveReportService],
})
export class LiveModule {}
