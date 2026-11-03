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
import { GalleryService } from './gallery.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  @Public()
  findAll(
    @CurrentUser() user: AuthUser | undefined,
    @Query('status') status?: ContentStatus,
  ) {
    // BE-04/P-B04-1: anonimci (portal, mobile home) uvijek vide samo
    // PUBLISHED — prije je barem /gallery vraćao i draft albume; status
    // filter (npr. PENDING moderacija) vrijedi samo za prijavljene.
    return this.galleryService.findAll(user ? status : ContentStatus.PUBLISHED);
  }

  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.galleryService.findBySlug(slug);
  }

  // BE-04/P-B04-1: @Public UKLONJEN — javni čitaoci koriste slug;
  // :id pozivaju isključivo admin paneli (globalni guard → 401 za anon).
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('gallery.manage')
  @ApiBearerAuth()
  create(@Body() body: { title: string; description?: string }) {
    return this.galleryService.create(body);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('gallery.manage')
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string | null },
  ) {
    return this.galleryService.update(id, body);
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('gallery.approve')
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body('status') status: ContentStatus) {
    return this.galleryService.updateStatus(id, status);
  }

  @Post(':id/photos')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('gallery.manage')
  @ApiBearerAuth()
  addPhoto(
    @Param('id') id: string,
    @Body() body: { path: string; caption?: string; sortOrder?: number },
  ) {
    return this.galleryService.addPhoto(id, body);
  }

  @Post(':id/photos/reorder')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('gallery.manage')
  @ApiBearerAuth()
  reorderPhotos(@Param('id') id: string, @Body('photoIds') photoIds: string[]) {
    return this.galleryService.reorderPhotos(id, photoIds);
  }

  @Delete(':id/photos/:photoId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('gallery.manage')
  @ApiBearerAuth()
  removePhoto(@Param('id') id: string, @Param('photoId') photoId: string) {
    return this.galleryService.removePhoto(id, photoId);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('gallery.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
