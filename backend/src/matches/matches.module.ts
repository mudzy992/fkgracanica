import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService],
  imports: [StatisticsModule],
  exports: [MatchesService],
})
export class MatchesModule {}
