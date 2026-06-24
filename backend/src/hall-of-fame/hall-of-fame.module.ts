import { Module } from '@nestjs/common';
import { HallOfFameService } from './hall-of-fame.service';
import { HallOfFameController } from './hall-of-fame.controller';

@Module({ controllers: [HallOfFameController], providers: [HallOfFameService] })
export class HallOfFameModule {}
