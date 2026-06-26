import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoundsService } from './rounds.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('rounds')
@Controller('rounds')
export class RoundsController {
  constructor(private readonly service: RoundsService) {}

  @Get()
  findBySeason(@Query('seasonId') seasonId: string) {
    return this.service.findBySeason(seasonId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  create(
    @Body()
    body: {
      seasonId: string;
      number: number;
      name?: string;
      startsAt?: string;
      endsAt?: string;
    },
  ) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body()
    body: {
      number?: number;
      name?: string;
      startsAt?: string | null;
      endsAt?: string | null;
    },
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
