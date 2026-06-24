import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
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
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class LiveController {
  constructor(private readonly service: LiveService) {}

  @Post('matches/:matchId/events')
  @RequirePermissions('live.manage')
  addEvent(
    @Param('matchId') matchId: string,
    @Body() body: { type: MatchEventType; minute: number; playerId?: string; teamSide?: string; description?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addEvent(matchId, { ...body, createdById: user.id });
  }

  @Post('matches/:matchId/comments')
  @RequirePermissions('live.manage')
  addComment(
    @Param('matchId') matchId: string,
    @Body() body: { message: string; minute?: number },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addComment(matchId, { ...body, userId: user.id });
  }

  @Post('matches/:matchId/start')
  @RequirePermissions('live.manage')
  startMatch(@Param('matchId') matchId: string) {
    return this.service.startMatch(matchId);
  }

  @Post('matches/:matchId/end')
  @RequirePermissions('live.manage')
  endMatch(@Param('matchId') matchId: string) {
    return this.service.endMatch(matchId);
  }

  @Post('matches/:matchId/approve')
  @RequirePermissions('live.approve')
  approveReport(@Param('matchId') matchId: string) {
    return this.service.approveReport(matchId);
  }
}
