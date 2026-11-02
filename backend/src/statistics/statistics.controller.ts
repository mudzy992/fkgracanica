import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  @Post('recalculate/:matchId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('statistics.manage')
  @ApiBearerAuth()
  recalculate(@Param('matchId') matchId: string) {
    return this.service.recalculateForMatch(matchId);
  }

  @Get('players/:playerId')
  @Public()
  getPlayerStats(
    @Param('playerId') playerId: string,
    @Query('seasonId') seasonId?: string,
  ) {
    return this.service.getPlayerStats(playerId, seasonId);
  }

  @Get('matches/:matchId')
  @Public()
  getTeamStats(@Param('matchId') matchId: string) {
    return this.service.getTeamStats(matchId);
  }

  @Get('matches/:matchId/overview')
  @Public()
  getMatchStatistics(@Param('matchId') matchId: string) {
    return this.service.getMatchStatistics(matchId);
  }

  @Get('standings')
  @Public()
  getStandings(
    @Query('seasonId') seasonId: string,
    @Query('upToRound') upToRound?: string,
  ) {
    const round = upToRound ? Number(upToRound) : undefined;
    return this.service.getStandings(
      seasonId,
      Number.isFinite(round) ? round : undefined,
    );
  }

  @Get('top-scorers')
  @Public()
  getTopScorers(@Query('seasonId') seasonId: string) {
    return this.service.getTopScorers(seasonId);
  }

  @Get('top-assists')
  @Public()
  getTopAssists(@Query('seasonId') seasonId: string) {
    return this.service.getTopAssists(seasonId);
  }

  @Get('cards-leaders')
  @Public()
  getCardsLeaders(@Query('seasonId') seasonId: string) {
    return this.service.getCardsLeaders(seasonId);
  }
}
