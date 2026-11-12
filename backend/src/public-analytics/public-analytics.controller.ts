import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { PublicAnalyticsService } from './public-analytics.service';
import { RecordVisitDto } from './dto/record-visit.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { getClientIp } from './client-ip.util';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('public-analytics')
@Controller('public-analytics')
export class PublicAnalyticsController {
  constructor(private readonly service: PublicAnalyticsService) {}

  @Post('visit')
  @Public()
  @HttpCode(204)
  recordVisit(@Body() dto: RecordVisitDto, @Req() req: Request): Promise<void> {
    return this.service.recordVisit(
      dto.platform,
      dto.visitorId,
      getClientIp(req),
    );
  }

  @Get('trend')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('analytics.read')
  @ApiBearerAuth()
  getTrend(@Query('days') days?: string) {
    return this.service.getDailyTrend(days ? Math.min(Number(days), 90) : 30);
  }

  @Get('totals')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('analytics.read')
  @ApiBearerAuth()
  getTotals(@Query('days') days?: string) {
    return this.service.getTotals(days ? Math.min(Number(days), 90) : 30);
  }

  @Get('geo')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('analytics.read')
  @ApiBearerAuth()
  getGeo(@Query('days') days?: string) {
    return this.service.getGeoStats(days ? Math.min(Number(days), 90) : 30);
  }
}
