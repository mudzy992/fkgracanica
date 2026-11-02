import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { CmsPagesService } from './cms-pages.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { widgetMeta } from './widgets/schemas';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('cms')
@Controller('cms')
export class CmsPagesController {
  constructor(private readonly pages: CmsPagesService) {}

  @Get('widgets')
  @Public()
  listWidgets() {
    return Object.entries(widgetMeta).map(([type, meta]) => ({
      type,
      ...meta,
    }));
  }

  @Get('pages')
  @Public()
  findAll(@Query('admin') admin?: string) {
    return this.pages.findAll(admin === '1');
  }

  @Get('pages/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string, @Query('admin') admin?: string) {
    return this.pages.findBySlug(slug, admin === '1');
  }

  @Post('pages')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('cms.manage')
  @ApiBearerAuth()
  create(
    @Body()
    body: {
      slug: string;
      title: string;
      status?: ContentStatus;
      seoTitle?: string;
      seoDesc?: string;
    },
  ) {
    return this.pages.create(body);
  }

  @Patch('pages/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('cms.manage')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.pages.update(id, body);
  }

  @Delete('pages/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('cms.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.pages.remove(id);
  }

  @Post('pages/:pageId/sections')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('cms.manage')
  @ApiBearerAuth()
  addSection(
    @Param('pageId') pageId: string,
    @Body() body: { widgetType: string; config?: object; enabled?: boolean },
  ) {
    return this.pages.addSection(pageId, body);
  }

  @Patch('pages/:pageId/sections/:sectionId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('cms.manage')
  @ApiBearerAuth()
  updateSection(
    @Param('pageId') pageId: string,
    @Param('sectionId') sectionId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.pages.updateSection(pageId, sectionId, body);
  }

  @Delete('pages/:pageId/sections/:sectionId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('cms.manage')
  @ApiBearerAuth()
  removeSection(
    @Param('pageId') pageId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.pages.removeSection(pageId, sectionId);
  }

  @Patch('pages/:pageId/sections/reorder')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('cms.manage')
  @ApiBearerAuth()
  reorder(@Param('pageId') pageId: string, @Body() body: { ids: string[] }) {
    return this.pages.reorderSections(pageId, body.ids);
  }
}
