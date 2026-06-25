import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('membership')
@Controller('membership')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembershipController {
  constructor(private readonly service: MembershipService) {}

  @Post('register')
  register(@CurrentUser() user: AuthUser) {
    return this.service.register(user.id);
  }

  @Get('me')
  findMine(@CurrentUser() user: AuthUser) {
    return this.service.findForUser(user.id);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('membership.manage')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('membership.manage')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/activate')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('membership.manage')
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @Patch(':id/renew')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('membership.manage')
  renew(@Param('id') id: string) {
    return this.service.renew(id);
  }

  @Patch(':id/suspend')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('membership.manage')
  suspend(@Param('id') id: string) {
    return this.service.suspend(id);
  }

  @Patch(':id/cancel')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('membership.manage')
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }
}
