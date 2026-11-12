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
import { TrophiesService } from './trophies.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('trophies')
@Controller('trophies')
export class TrophiesController {
  constructor(private readonly service: TrophiesService) {}

  @Get()
  @Public()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('trophies.manage')
  @ApiBearerAuth()
  create(@Body() body: Record<string, unknown>) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('trophies.manage')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('trophies.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
