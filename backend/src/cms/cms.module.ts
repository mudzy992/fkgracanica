import { Module } from '@nestjs/common';
import { CmsPagesService } from './cms-pages.service';
import { CmsPagesController } from './cms-pages.controller';
import { CmsMenusService } from './cms-menus.service';
import { CmsMenusController } from './cms-menus.controller';

@Module({
  controllers: [CmsPagesController, CmsMenusController],
  providers: [CmsPagesService, CmsMenusService],
})
export class CmsModule {}
