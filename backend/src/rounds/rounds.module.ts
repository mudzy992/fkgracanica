import { Module } from '@nestjs/common';
import { RoundsController } from './rounds.controller';
import { RoundsService } from './rounds.service';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  controllers: [RoundsController],
  providers: [RoundsService],
  imports: [StatisticsModule],
  exports: [RoundsService],
})
export class RoundsModule {}
