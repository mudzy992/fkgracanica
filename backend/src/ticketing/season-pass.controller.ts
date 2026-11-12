import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SeasonPassService } from './season-pass.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('ticketing')
@Controller('ticketing/season-pass')
@ApiBearerAuth()
export class SeasonPassController {
  constructor(private readonly service: SeasonPassService) {}

  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.service.mine(user.id);
  }

  @Post('open')
  open(@CurrentUser() user: AuthUser) {
    return this.service.openPending(user.id);
  }

  @Get('admin')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ticketing.manage')
  listAdmin() {
    return this.service.listAdmin();
  }

  @Post('admin/issue')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ticketing.manage')
  issue(@Body('email') email: string) {
    return this.service.issueBoxOffice(email);
  }
}
