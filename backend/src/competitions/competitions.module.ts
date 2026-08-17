import { Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { SeasonsService } from './seasons.service';
import { SeasonsController } from './seasons.controller';
import { SeasonCompetitionsService } from './season-competitions.service';

@Module({
  controllers: [CompetitionsController, SeasonsController],
  providers: [CompetitionsService, SeasonsService, SeasonCompetitionsService],
  exports: [CompetitionsService, SeasonsService, SeasonCompetitionsService],
})
export class CompetitionsModule {}
