import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CmsMenusService } from './cms-menus.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('cms')
@Controller('cms/menus')
export class CmsMenusController {
  constructor(private readonly menus: CmsMenusService) {}

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.menus.findByKey(key);
  }

  @Put(':key')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('cms.manage')
  @ApiBearerAuth()
  replace(
    @Param('key') key: string,
    @Body()
    body: {
      items: Array<{
        id?: string;
        label: string;
        sortOrder: number;
        pageId?: string | null;
        path?: string | null;
        externalUrl?: string | null;
        parentId?: string | null;
        enabled?: boolean;
      }>;
    },
  ) {
    return this.menus.saveItems(key, body.items);
  }
}
