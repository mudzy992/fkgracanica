import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MatchHighlightsController } from './match-highlights.controller';
import { MatchHighlightsService } from './match-highlights.service';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  controllers: [MatchesController, MatchHighlightsController],
  providers: [MatchesService, MatchHighlightsService],
  imports: [StatisticsModule],
  exports: [MatchesService],
})
export class MatchesModule {}
