import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MatchEventType } from '@prisma/client';
import { LiveService } from './live.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('live')
@Controller('live')
export class LiveController {
  constructor(private readonly service: LiveService) {}

  @Get('matches/:matchId/feed')
  getFeed(@Param('matchId') matchId: string) {
    return this.service.getFeed(matchId);
  }

  @Post('matches/:matchId/events')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  addEvent(
    @Param('matchId') matchId: string,
    @Body() body: { type: MatchEventType; minute: number; playerId?: string; teamSide?: string; description?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addEvent(matchId, { ...body, createdById: user.id });
  }

  @Post('matches/:matchId/comments')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  addComment(
    @Param('matchId') matchId: string,
    @Body() body: { message: string; minute?: number },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addComment(matchId, { ...body, userId: user.id });
  }

  @Post('matches/:matchId/start')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  startMatch(@Param('matchId') matchId: string) {
    return this.service.startMatch(matchId);
  }

  @Post('matches/:matchId/end')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  endMatch(@Param('matchId') matchId: string) {
    return this.service.endMatch(matchId);
  }

  @Post('matches/:matchId/approve')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.approve')
  @ApiBearerAuth()
  approveReport(@Param('matchId') matchId: string) {
    return this.service.approveReport(matchId);
  }
}
