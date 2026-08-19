import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PublicAnalyticsService } from './public-analytics.service';
import { RecordVisitDto } from './dto/record-visit.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('public-analytics')
@Controller('public-analytics')
export class PublicAnalyticsController {
  constructor(private readonly service: PublicAnalyticsService) {}

  @Post('visit')
  @HttpCode(204)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  recordVisit(@Body() dto: RecordVisitDto): Promise<void> {
    return this.service.recordVisit(dto.platform, dto.visitorId);
  }

  @Get('trend')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('analytics.read')
  @ApiBearerAuth()
  getTrend(@Query('days') days?: string) {
    return this.service.getDailyTrend(days ? Math.min(Number(days), 90) : 30);
  }

  @Get('totals')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('analytics.read')
  @ApiBearerAuth()
  getTotals(@Query('days') days?: string) {
    return this.service.getTotals(days ? Math.min(Number(days), 90) : 30);
  }
}
