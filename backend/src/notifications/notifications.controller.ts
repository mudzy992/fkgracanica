import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';
import { NotificationsListQueryDto } from './dto/notifications-list-query.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: NotificationsListQueryDto) {
    return this.notificationsService.findForUser(
      user.id,
      query,
      query.unreadOnly === true,
    );
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: AuthUser) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.notificationsService.markRead(id, user.id);
  }

  @Post('devices')
  registerDevice(@CurrentUser() user: AuthUser, @Body() dto: RegisterDeviceDto) {
    return this.notificationsService.registerDevice(user.id, dto.token, dto.platform);
  }

  @Delete('devices/:token')
  unregisterDevice(@CurrentUser() user: AuthUser, @Param('token') token: string) {
    return this.notificationsService.unregisterDevice(user.id, decodeURIComponent(token));
  }
}
