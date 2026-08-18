import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LiveReportService } from './live-report.service';
import { ReportEventDto } from './live.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('live')
@Controller('live')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('live.manage')
@ApiBearerAuth()
export class LiveReportController {
  constructor(private readonly reports: LiveReportService) {}

  @Post('matches/:matchId/report/events')
  addReportEvent(
    @Param('matchId') matchId: string,
    @Body() body: ReportEventDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reports.addEvent(matchId, { ...body, createdById: user.id });
  }

  @Delete('matches/:matchId/report/events/:eventId')
  deleteReportEvent(@Param('matchId') matchId: string, @Param('eventId') eventId: string) {
    return this.reports.deleteEvent(matchId, eventId);
  }

  @Post('matches/:matchId/report/comments')
  addReportComment(
    @Param('matchId') matchId: string,
    @Body() body: { message: string; minute: number },
    @CurrentUser() user: AuthUser,
  ) {
    return this.reports.addComment(matchId, { ...body, userId: user.id });
  }

  @Post('matches/:matchId/report/submit')
  submitReport(@Param('matchId') matchId: string) {
    return this.reports.submitReport(matchId);
  }
}
