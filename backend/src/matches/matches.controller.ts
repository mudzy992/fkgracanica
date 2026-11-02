import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './create-match.dto';
import { UpdateMatchDto } from './update-match.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly service: MatchesService) {}

  @Get()
  @Public()
  findAll(
    @Query('seasonId') seasonId?: string,
    @Query('roundId') roundId?: string,
  ) {
    return this.service.findAll(seasonId, roundId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('matches.manage')
  @ApiBearerAuth()
  create(@Body() body: CreateMatchDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('matches.manage')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: UpdateMatchDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('matches.manage')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Put(':id/lineup')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('matches.manage')
  @ApiBearerAuth()
  setLineup(
    @Param('id') id: string,
    @Body()
    body: {
      slots: {
        playerId: string;
        clubId: string;
        isStarter?: boolean;
        positionX?: number;
        positionY?: number;
      }[];
    },
  ) {
    return this.service.setLineup(id, body.slots);
  }
}
