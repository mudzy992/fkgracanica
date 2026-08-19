import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, parsePagination } from '../common/utils/pagination.util';

@ApiTags('email-log')
@Controller('email-log')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('settings.read')
@ApiBearerAuth()
export class EmailLogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    const params = parsePagination({ page: Number(page), limit: Number(limit) });
    return paginate(
      params,
      (skip, take) =>
        this.prisma.failedEmail.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
      () => this.prisma.failedEmail.count(),
    );
  }
}
