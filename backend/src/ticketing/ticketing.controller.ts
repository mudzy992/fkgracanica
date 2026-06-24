import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TicketingService } from './ticketing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('ticketing')
@Controller('ticketing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketingController {
  constructor(private readonly service: TicketingService) {}

  @Post('reserve')
  reserve(
    @CurrentUser() user: AuthUser,
    @Body() body: { matchId: string; category: string; price: number; quantity?: number },
  ) {
    return this.service.reserve(user.id, body);
  }

  @Get('orders')
  findOrders(@CurrentUser() user: AuthUser) {
    return this.service.findOrders(user.id);
  }

  @Post('validate')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ticketing.manage')
  validate(@Body('qrCode') qrCode: string) {
    return this.service.validateTicket(qrCode);
  }

  @Post('orders/:orderId/confirm-payment')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ticketing.manage')
  confirmPayment(@Param('orderId') orderId: string) {
    return this.service.confirmBoxOfficePayment(orderId);
  }

  @Get('admin/orders')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ticketing.manage')
  findAllOrders() {
    return this.service.findAllOrders();
  }

  @Post('orders/:orderId/refund')
  refund(
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.requestRefund(orderId, user.id);
  }
}
