import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompetitionsService } from './competitions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('competitions')
@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly service: CompetitionsService) {}

  @Get()
  findCompetitions() {
    return this.service.findCompetitions();
  }

  @Get('seasons/list')
  findSeasons(@Query('competitionId') competitionId?: string) {
    return this.service.findSeasons(competitionId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  createCompetition(@Body() body: { name: string }) {
    return this.service.createCompetition(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  updateCompetition(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.updateCompetition(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  removeCompetition(@Param('id') id: string) {
    return this.service.removeCompetition(id);
  }

  @Post('seasons')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  createSeason(@Body() body: { name: string; yearStart: number; yearEnd: number; competitionId: string; isActive?: boolean }) {
    return this.service.createSeason(body);
  }

  @Patch('seasons/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  updateSeason(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.updateSeason(id, body);
  }

  @Delete('seasons/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  removeSeason(@Param('id') id: string) {
    return this.service.removeSeason(id);
  }
}
