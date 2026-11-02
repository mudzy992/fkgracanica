import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import { ClubSquadService } from './club-squad.service';
import { ClubStadiumService } from './club-stadium.service';
import { ClubStatsService } from './club-stats.service';
import { ClubPublicService } from './club-public.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('clubs')
@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly service: ClubsService,
    private readonly squad: ClubSquadService,
    private readonly stadium: ClubStadiumService,
    private readonly stats: ClubStatsService,
    private readonly publicProfile: ClubPublicService,
  ) {}

  @Get()
  @Public()
  findAll() {
    return this.service.findAll();
  }

  @Get('own')
  @Public()
  findOwn() {
    return this.service.findOwn();
  }

  @Get('public/:slug')
  @Public()
  getPublicBySlug(@Param('slug') slug: string) {
    return this.publicProfile.getBySlug(slug);
  }

  @Get(':id/squad')
  @Public()
  async getSquad(@Param('id') id: string) {
    await this.squad.ensureSquadInitialized(id);
    return this.squad.getSquad(id);
  }

  @Get(':id/stadium')
  @Public()
  getStadium(@Param('id') id: string) {
    return this.stadium.getByClubId(id);
  }

  @Get(':id/stats')
  @Public()
  getStats(@Param('id') id: string, @Query('seasonId') seasonId?: string) {
    return this.stats.getClubSeasonStats(id, seasonId);
  }

  @Get(':id/participations')
  @Public()
  listParticipations(@Param('id') id: string) {
    return this.stats.listClubParticipations(id);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('clubs.manage')
  @ApiBearerAuth()
  create(@Body() body: Record<string, unknown>) {
    return this.service.create(body as Parameters<ClubsService['create']>[0]);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('clubs.manage')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.update(id, body);
  }

  @Put(':id/formation')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('clubs.manage')
  @ApiBearerAuth()
  updateFormation(
    @Param('id') id: string,
    @Body() body: { def: number; mid: number; fwd: number },
  ) {
    return this.squad.updateFormation(id, body.def, body.mid, body.fwd);
  }

  @Put(':id/squad')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('clubs.manage')
  @ApiBearerAuth()
  assignSquad(
    @Param('id') id: string,
    @Body()
    body: {
      assignments: {
        slotIndex: number;
        isBench: boolean;
        playerId?: string | null;
      }[];
    },
  ) {
    return this.squad.assignSlots(id, body.assignments);
  }

  @Put(':id/stadium')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('clubs.manage')
  @ApiBearerAuth()
  upsertStadium(
    @Param('id') id: string,
    @Body()
    body: {
      name: string;
      address?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
      imagePath?: string;
      capacity?: number;
      description?: string;
    },
  ) {
    return this.stadium.upsert(id, body);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('clubs.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
