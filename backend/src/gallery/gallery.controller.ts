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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  findAll(@Query('status') status?: ContentStatus) {
    return this.galleryService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('gallery.manage')
  @ApiBearerAuth()
  create(@Body() body: { title: string; description?: string }) {
    return this.galleryService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('gallery.manage')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.galleryService.update(id, body);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('gallery.approve')
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body('status') status: ContentStatus) {
    return this.galleryService.updateStatus(id, status);
  }

  @Post(':id/photos')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('gallery.manage')
  @ApiBearerAuth()
  addPhoto(@Param('id') id: string, @Body() body: { path: string; caption?: string; sortOrder?: number }) {
    return this.galleryService.addPhoto(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('gallery.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
