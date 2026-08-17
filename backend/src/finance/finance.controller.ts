import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { FinanceService } from './finance.service';
import type { FinanceQuery } from './finance.types';

@ApiTags('finance')
@Controller('finance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('finance.read')
@ApiBearerAuth()
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @Get('summary')
  summary(@Query() query: FinanceQuery) {
    return this.service.summary(query);
  }

  @Get('export.xlsx')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportXlsx(@Query() query: FinanceQuery, @Res() res: Response) {
    const buf = await this.service.exportXlsx(query);
    res.setHeader('Content-Disposition', 'attachment; filename="finansije.xlsx"');
    res.send(buf);
  }

  @Get('export.pdf')
  @Header('Content-Type', 'application/pdf')
  async exportPdf(@Query() query: FinanceQuery, @Res() res: Response) {
    const buf = await this.service.exportPdf(query);
    res.setHeader('Content-Disposition', 'attachment; filename="finansije.pdf"');
    res.send(buf);
  }
}
