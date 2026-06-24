import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('analytics.read')
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('team')
  getTeamAnalytics(@Query('seasonId') seasonId?: string) {
    return this.service.getTeamAnalytics(seasonId);
  }

  @Get('players/:playerId')
  getPlayerAnalytics(@Param('playerId') playerId: string) {
    return this.service.getPlayerAnalytics(playerId);
  }
}
