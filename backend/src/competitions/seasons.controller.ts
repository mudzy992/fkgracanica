import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SeasonsService } from './seasons.service';
import { SeasonCompetitionsService } from './season-competitions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('seasons')
@Controller('seasons')
export class SeasonsController {
  constructor(
    private readonly seasons: SeasonsService,
    private readonly editions: SeasonCompetitionsService,
  ) {}

  @Get()
  findAll() {
    return this.seasons.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seasons.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  create(@Body() body: { name: string; yearStart: number; yearEnd: number; isActive?: boolean }) {
    return this.seasons.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; yearStart?: number; yearEnd?: number; isActive?: boolean },
  ) {
    return this.seasons.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.seasons.remove(id);
  }

  @Get(':id/competitions')
  listEditions(@Param('id') id: string) {
    return this.editions.list(id);
  }

  @Post(':id/competitions')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  addEdition(
    @Param('id') id: string,
    @Body() body: { competitionId?: string; name?: string; isLeague?: boolean; clubIds?: string[] },
  ) {
    return this.editions.add(id, body);
  }

  @Patch(':id/competitions/:editionId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  removeEdition(@Param('id') id: string, @Param('editionId') editionId: string) {
    return this.editions.remove(id, editionId);
  }
}
