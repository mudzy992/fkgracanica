import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MatchEventType } from '@prisma/client';
import { IsIn, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';
import { LiveService } from './live.service';
import { LivePhaseService } from './live-phase.service';
import { LiveReportService } from './live-report.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

class AddEventDto {
  @IsString()
  type!: MatchEventType;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(130)
  minute?: number;

  @IsOptional()
  @IsString()
  playerId?: string;

  @IsOptional()
  @IsString()
  relatedPlayerId?: string;

  @IsOptional()
  @IsString()
  teamSide?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class ReportEventDto {
  @IsString()
  type!: MatchEventType;

  @IsInt()
  @Min(0)
  @Max(130)
  minute!: number;

  @IsOptional()
  @IsString()
  playerId?: string;

  @IsOptional()
  @IsString()
  relatedPlayerId?: string;

  @IsOptional()
  @IsString()
  teamSide?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class SetStoppageDto {
  @IsIn([1, 2, 3, 4])
  half!: 1 | 2 | 3 | 4;

  @IsInt()
  @Min(1)
  @Max(15)
  minutes!: number;
}

class SetLiveStreamDto {
  @IsOptional()
  @IsString()
  url?: string | null;
}

@ApiTags('live')
@Controller('live')
export class LiveController {
  constructor(
    private readonly service: LiveService,
    private readonly phases: LivePhaseService,
    private readonly reports: LiveReportService,
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
  addEvent(@Param('matchId') matchId: string, @Body() body: AddEventDto, @CurrentUser() user: AuthUser) {
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

  @Post('matches/:matchId/stoppage')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  setStoppage(@Param('matchId') matchId: string, @Body() body: SetStoppageDto) {
    return this.service.setStoppage(matchId, body.half, body.minutes);
  }

  @Patch('matches/:matchId/stream')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  setLiveStream(@Param('matchId') matchId: string, @Body() body: SetLiveStreamDto) {
    return this.service.setLiveStream(matchId, body.url ?? null);
  }

  @Post('matches/:matchId/end')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  endMatch(@Param('matchId') matchId: string) {
    return this.service.endMatch(matchId);
  }

  @Post('matches/:matchId/halftime')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  setHalftime(@Param('matchId') matchId: string) {
    return this.service.setHalftime(matchId);
  }

  @Post('matches/:matchId/resume')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  resumeSecondHalf(@Param('matchId') matchId: string) {
    return this.service.resumeSecondHalf(matchId);
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

  @Post('matches/:matchId/report/events')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  addReportEvent(
    @Param('matchId') matchId: string,
    @Body() body: ReportEventDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reports.addEvent(matchId, { ...body, createdById: user.id });
  }

  @Delete('matches/:matchId/report/events/:eventId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  deleteReportEvent(@Param('matchId') matchId: string, @Param('eventId') eventId: string) {
    return this.reports.deleteEvent(matchId, eventId);
  }

  @Post('matches/:matchId/report/comments')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  addReportComment(
    @Param('matchId') matchId: string,
    @Body() body: { message: string; minute: number },
    @CurrentUser() user: AuthUser,
  ) {
    return this.reports.addComment(matchId, { ...body, userId: user.id });
  }

  @Post('matches/:matchId/report/submit')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('live.manage')
  @ApiBearerAuth()
  submitReport(@Param('matchId') matchId: string) {
    return this.reports.submitReport(matchId);
  }
}
