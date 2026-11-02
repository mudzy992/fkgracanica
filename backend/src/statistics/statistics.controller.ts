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
  getPlayerStats(
    @Param('playerId') playerId: string,
    @Query('seasonId') seasonId?: string,
  ) {
    return this.service.getPlayerStats(playerId, seasonId);
  }

  @Get('matches/:matchId')
  getTeamStats(@Param('matchId') matchId: string) {
    return this.service.getTeamStats(matchId);
  }

  @Get('matches/:matchId/overview')
  getMatchStatistics(@Param('matchId') matchId: string) {
    return this.service.getMatchStatistics(matchId);
  }

  @Get('standings')
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
  getTopScorers(@Query('seasonId') seasonId: string) {
    return this.service.getTopScorers(seasonId);
  }

  @Get('top-assists')
  getTopAssists(@Query('seasonId') seasonId: string) {
    return this.service.getTopAssists(seasonId);
  }

  @Get('cards-leaders')
  getCardsLeaders(@Query('seasonId') seasonId: string) {
    return this.service.getCardsLeaders(seasonId);
  }
}
