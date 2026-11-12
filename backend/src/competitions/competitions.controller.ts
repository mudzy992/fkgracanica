import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompetitionsService } from './competitions.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('competitions')
@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly service: CompetitionsService) {}

  @Get()
  @Public()
  findCompetitions() {
    return this.service.findCompetitions();
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  createCompetition(@Body() body: { name: string; isLeague?: boolean }) {
    return this.service.createCompetition(body);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  updateCompetition(
    @Param('id') id: string,
    @Body() body: { name?: string; isLeague?: boolean },
  ) {
    return this.service.updateCompetition(id, body);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('competitions.manage')
  @ApiBearerAuth()
  removeCompetition(@Param('id') id: string) {
    return this.service.removeCompetition(id);
  }
}
