import { Module } from '@nestjs/common';
import { ClubTimelineService } from './club-timeline.service';
import { ClubTimelineController } from './club-timeline.controller';

@Module({
  controllers: [ClubTimelineController],
  providers: [ClubTimelineService],
})
export class ClubTimelineModule {}
