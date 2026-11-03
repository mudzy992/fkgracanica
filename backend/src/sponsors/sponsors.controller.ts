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
import { SponsorsService } from './sponsors.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('sponsors')
@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly service: SponsorsService) {}

  @Get()
  @Public()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('sponsors.manage')
  @ApiBearerAuth()
  create(@Body() body: Record<string, unknown>) {
    return this.service.create(body);
  }

  @Post('reorder')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('sponsors.manage')
  @ApiBearerAuth()
  reorder(@Body('ids') ids: unknown) {
    return this.service.reorder(ids);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('sponsors.manage')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('sponsors.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
