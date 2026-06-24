import { Module } from '@nestjs/common';
import { MuseumService } from './museum.service';
import { MuseumController } from './museum.controller';

@Module({ controllers: [MuseumController], providers: [MuseumService] })
export class MuseumModule {}
