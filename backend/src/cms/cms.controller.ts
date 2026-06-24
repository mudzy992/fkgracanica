import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('cms')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('blocks')
  findAll() {
    return this.cmsService.findAll();
  }

  @Get('blocks/:id')
  findOne(@Param('id') id: string) {
    return this.cmsService.findOne(id);
  }

  @Post('blocks')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('cms.manage')
  @ApiBearerAuth()
  create(@Body() body: { key: string; title: string; content: object; page?: string }) {
    return this.cmsService.create(body);
  }

  @Patch('blocks/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('cms.manage')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.cmsService.update(id, body);
  }

  @Delete('blocks/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('cms.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.cmsService.remove(id);
  }
}
