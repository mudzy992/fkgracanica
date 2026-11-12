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
import { SeasonsService } from './seasons.service';
import { SeasonCompetitionsService } from './season-competitions.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('seasons')
@Controller('seasons')
export class SeasonsController {
  constructor(
    private readonly seasons: SeasonsService,
    private readonly editions: SeasonCompetitionsService,
  ) {}

  @Get()
  @Public()
  findAll() {
    return this.seasons.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.seasons.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  create(
    @Body()
    body: {
      name: string;
      yearStart: number;
      yearEnd: number;
      isActive?: boolean;
    },
  ) {
    return this.seasons.create(body);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      yearStart?: number;
      yearEnd?: number;
      isActive?: boolean;
    },
  ) {
    return this.seasons.update(id, body);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.seasons.remove(id);
  }

  @Get(':id/competitions')
  @Public()
  listEditions(@Param('id') id: string) {
    return this.editions.list(id);
  }

  @Post(':id/competitions')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  addEdition(
    @Param('id') id: string,
    @Body()
    body: {
      competitionId?: string;
      name?: string;
      isLeague?: boolean;
      clubIds?: string[];
    },
  ) {
    return this.editions.add(id, body);
  }

  @Patch(':id/competitions/:editionId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  updateEdition(
    @Param('id') id: string,
    @Param('editionId') editionId: string,
    @Body() body: { clubIds?: string[] },
  ) {
    return this.editions.update(id, editionId, body.clubIds);
  }

  @Delete(':id/competitions/:editionId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  removeEdition(
    @Param('id') id: string,
    @Param('editionId') editionId: string,
  ) {
    return this.editions.remove(id, editionId);
  }
}
