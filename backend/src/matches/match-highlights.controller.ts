import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { MatchHighlightsService } from './match-highlights.service';
import { CreateMatchHighlightDto, UpdateMatchHighlightDto } from './match-highlight.dto';

@ApiTags('matches')
@Controller('matches/:matchId/highlights')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('matches.manage')
@ApiBearerAuth()
export class MatchHighlightsController {
  constructor(private readonly service: MatchHighlightsService) {}

  @Post()
  create(@Param('matchId') matchId: string, @Body() body: CreateMatchHighlightDto) {
    return this.service.create(matchId, body);
  }

  @Patch(':id')
  update(
    @Param('matchId') matchId: string,
    @Param('id') id: string,
    @Body() body: UpdateMatchHighlightDto,
  ) {
    return this.service.update(matchId, id, body);
  }

  @Delete(':id')
  remove(@Param('matchId') matchId: string, @Param('id') id: string) {
    return this.service.remove(matchId, id);
  }
}
