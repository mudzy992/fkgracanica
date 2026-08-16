import { Module } from '@nestjs/common';
import { ShowcaseController } from './showcase.controller';
import { ShowcaseAdminController } from './showcase-admin.controller';
import { ShowcaseService } from './showcase.service';

@Module({
  controllers: [ShowcaseController, ShowcaseAdminController],
  providers: [ShowcaseService],
})
export class ShowcaseModule {}
