import { Module, forwardRef } from '@nestjs/common';
import { LiveService } from './live.service';
import { LivePhaseService } from './live-phase.service';
import { LiveController } from './live.controller';
import { RealtimeModule } from '../realtime/realtime.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { LiveReportService } from './live-report.service';

@Module({
  imports: [forwardRef(() => RealtimeModule), StatisticsModule],
  controllers: [LiveController],
  providers: [LiveService, LivePhaseService, LiveReportService],
})
export class LiveModule {}
