import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  @Post('recalculate/:matchId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('statistics.manage')
  @ApiBearerAuth()
  recalculate(@Param('matchId') matchId: string) {
    return this.service.recalculateForMatch(matchId);
  }

  @Get('players/:playerId')
  getPlayerStats(@Param('playerId') playerId: string, @Query('seasonId') seasonId?: string) {
    return this.service.getPlayerStats(playerId, seasonId);
  }

  @Get('matches/:matchId')
  getTeamStats(@Param('matchId') matchId: string) {
    return this.service.getTeamStats(matchId);
  }

  @Get('standings')
  getStandings(@Query('seasonId') seasonId: string) {
    return this.service.getStandings(seasonId);
  }
}
