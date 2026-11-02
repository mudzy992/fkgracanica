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
import { PlayersService } from './players.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('players')
@Controller('players')
export class PlayersController {
  constructor(private readonly service: PlayersService) {}

  @Get()
  @Public()
  findAll(
    @Query('clubId') clubId?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.service.findAll(clubId, activeOnly === 'true');
  }

  @Get(':id/matches')
  @Public()
  getPublicMatches(@Param('id') id: string) {
    return this.service.getPublicMatches(id);
  }

  @Get(':id/public')
  @Public()
  getPublicProfile(
    @Param('id') id: string,
    @Query('seasonId') seasonId?: string,
  ) {
    return this.service.getPublicProfile(id, seasonId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('players.manage')
  @ApiBearerAuth()
  create(@Body() body: Record<string, unknown>) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('players.manage')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('players.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
