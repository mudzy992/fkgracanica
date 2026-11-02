import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LiveService } from './live.service';
import { LiveClockOpsService } from './live-clock-ops.service';
import { LivePhaseService } from './live-phase.service';
import { AddEventDto, SetLiveStreamDto, SetStoppageDto } from './live.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('live')
@Controller('live')
export class LiveController {
  constructor(
    private readonly service: LiveService,
    private readonly clock: LiveClockOpsService,
    private readonly phases: LivePhaseService,
  ) {}

  @Get('pending')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.approve')
  @ApiBearerAuth()
  listPending() {
    return this.service.listPendingApproval();
  }

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
    @Body() body: AddEventDto,
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
    return this.clock.startMatch(matchId);
  }

  @Post('matches/:matchId/stoppage')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  setStoppage(@Param('matchId') matchId: string, @Body() body: SetStoppageDto) {
    return this.clock.setStoppage(matchId, body.half, body.minutes);
  }

  @Patch('matches/:matchId/stream')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  setLiveStream(
    @Param('matchId') matchId: string,
    @Body() body: SetLiveStreamDto,
  ) {
    return this.service.setLiveStream(matchId, body.url ?? null);
  }

  @Post('matches/:matchId/end')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  endMatch(@Param('matchId') matchId: string) {
    return this.clock.endMatch(matchId);
  }

  @Post('matches/:matchId/halftime')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  setHalftime(@Param('matchId') matchId: string) {
    return this.clock.setHalftime(matchId);
  }

  @Post('matches/:matchId/resume')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  resumeSecondHalf(@Param('matchId') matchId: string) {
    return this.clock.resumeSecondHalf(matchId);
  }

  @Post('matches/:matchId/regular-time/end')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  finishRegularTime(@Param('matchId') matchId: string) {
    return this.phases.finishRegularTime(matchId);
  }

  @Post('matches/:matchId/extra-time/start')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  startExtraTime(@Param('matchId') matchId: string) {
    return this.phases.startExtraTime(matchId);
  }

  @Post('matches/:matchId/extra-time/halftime')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  extraTimeHalftime(@Param('matchId') matchId: string) {
    return this.phases.extraTimeHalftime(matchId);
  }

  @Post('matches/:matchId/extra-time/resume')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  resumeExtraSecond(@Param('matchId') matchId: string) {
    return this.phases.resumeExtraSecond(matchId);
  }

  @Post('matches/:matchId/extra-time/end')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  finishExtraTime(@Param('matchId') matchId: string) {
    return this.phases.finishExtraTime(matchId);
  }

  @Post('matches/:matchId/penalties/start')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  startPenalties(@Param('matchId') matchId: string) {
    return this.phases.startPenalties(matchId);
  }

  @Post('matches/:matchId/penalties/end')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  endAfterPenalties(@Param('matchId') matchId: string) {
    return this.phases.endAfterPenalties(matchId);
  }

  @Post('matches/:matchId/approve')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.approve')
  @ApiBearerAuth()
  approveReport(@Param('matchId') matchId: string) {
    return this.service.approveReport(matchId);
  }
}
