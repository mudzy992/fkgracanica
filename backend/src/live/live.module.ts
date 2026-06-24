import { Module, forwardRef } from '@nestjs/common';
import { LiveService } from './live.service';
import { LiveController } from './live.controller';
import { RealtimeModule } from '../realtime/realtime.module';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [forwardRef(() => RealtimeModule), StatisticsModule],
  controllers: [LiveController],
  providers: [LiveService],
})
export class LiveModule {}
