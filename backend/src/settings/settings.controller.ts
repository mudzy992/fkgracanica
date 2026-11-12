import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  @Public()
  getPublic() {
    return this.settingsService.getPublic();
  }

  @Get('module-flags')
  @Public()
  getModuleFlags() {
    return this.settingsService.getModuleFlags();
  }

  @Get('private')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('settings.read')
  @ApiBearerAuth()
  getPrivate() {
    return this.settingsService.getPrivate();
  }

  @Put('public')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('settings.update')
  @ApiBearerAuth()
  updatePublic(
    @Body() body: Record<string, string>,
    @CurrentUser() user: AuthUser,
  ) {
    return this.settingsService.updatePublic(body, user.id);
  }

  @Put('private')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('settings.update')
  @ApiBearerAuth()
  updatePrivate(
    @Body() body: Record<string, string>,
    @CurrentUser() user: AuthUser,
  ) {
    return this.settingsService.updatePrivate(body, user.id);
  }
}
