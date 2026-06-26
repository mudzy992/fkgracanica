import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { ClubSquadService } from './club-squad.service';
import { ClubStadiumService } from './club-stadium.service';
import { ClubStatsService } from './club-stats.service';
import { ClubPublicService } from './club-public.service';

@Module({
  controllers: [ClubsController],
  providers: [ClubsService, ClubSquadService, ClubStadiumService, ClubStatsService, ClubPublicService],
  exports: [ClubsService, ClubSquadService, ClubStadiumService, ClubStatsService, ClubPublicService],
})
export class ClubsModule {}
