import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { UpdateMatchDto } from './update-match.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly service: MatchesService) {}

  @Get()
  findAll(@Query('seasonId') seasonId?: string, @Query('roundId') roundId?: string) {
    return this.service.findAll(seasonId, roundId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('matches.manage')
  @ApiBearerAuth()
  create(@Body() body: Record<string, unknown>) {
    return this.service.create(body as Parameters<MatchesService['create']>[0]);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('matches.manage')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: UpdateMatchDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('matches.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Put(':id/lineup')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('matches.manage')
  @ApiBearerAuth()
  setLineup(
    @Param('id') id: string,
    @Body() body: { slots: { playerId: string; clubId: string; isStarter?: boolean; positionX?: number; positionY?: number }[] },
  ) {
    return this.service.setLineup(id, body.slots);
  }
}
