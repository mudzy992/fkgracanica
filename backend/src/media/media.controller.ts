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
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('media.manage')
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('folders')
  findFolders() {
    return this.mediaService.findFolders();
  }

  @Post('folders')
  createFolder(@Body() body: { name: string; parentId?: string }) {
    return this.mediaService.createFolder(body.name, body.parentId);
  }

  @Patch('folders/:id')
  updateFolder(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.mediaService.updateFolder(id, body);
  }

  @Delete('folders/:id')
  removeFolder(@Param('id') id: string) {
    return this.mediaService.removeFolder(id);
  }

  @Get('assets')
  findAssets(@Query('folderId') folderId?: string) {
    return this.mediaService.findAssets(folderId);
  }

  @Post('assets')
  createAsset(@Body() body: Record<string, unknown>) {
    return this.mediaService.createAsset(body as Parameters<MediaService['createAsset']>[0]);
  }

  @Patch('assets/:id')
  updateAsset(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.mediaService.updateAsset(id, body);
  }

  @Delete('assets/:id')
  removeAsset(@Param('id') id: string) {
    return this.mediaService.removeAsset(id);
  }
}
