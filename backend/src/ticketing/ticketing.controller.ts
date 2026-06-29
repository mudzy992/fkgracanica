import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TicketingService } from './ticketing.service';
import { TicketingConfigService } from './ticketing-config.service';
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
  constructor(
    private readonly service: TicketingService,
    private readonly config: TicketingConfigService,
  ) {}

  @Get('admin/config')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ticketing.manage')
  getAdminConfig() {
    return this.config.getAdminConfig();
  }

  @Patch('admin/config')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ticketing.manage')
  updateAdminConfig(@Body() body: Record<string, string>, @CurrentUser() user: AuthUser) {
    return this.config.updateAdminConfig(body, user.id);
  }

  @Post('reserve')
  reserve(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      matchId?: string;
      category: string;
      price: number;
      quantity?: number;
      categoryId?: string;
      paymentIntent?: 'box_office' | 'online';
    },
  ) {
    return this.service.reserve(user.id, body);
  }

  @Get('matches/:matchId/availability')
  getAvailability(@Param('matchId') matchId: string, @CurrentUser() user: AuthUser) {
    return this.service.getMatchAvailability(matchId, user.id);
  }

  @Get('orders')
  findOrders(@CurrentUser() user: AuthUser) {
    return this.service.findOrders(user.id);
  }

  @Get('orders/:orderId')
  findOrder(@Param('orderId') orderId: string, @CurrentUser() user: AuthUser) {
    return this.service.findOrderById(orderId);
  }

  @Post('orders/:orderId/cancel')
  cancelOrder(@Param('orderId') orderId: string, @CurrentUser() user: AuthUser) {
    return this.service.cancelOrder(orderId, user.id);
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

  @Post('admin/orders/:orderId/cancel')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ticketing.manage')
  adminCancelOrder(@Param('orderId') orderId: string) {
    return this.service.adminCancelOrder(orderId);
  }

  @Get('admin/orders')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ticketing.manage')
  findAllOrders(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAllOrders(Number(page) || 1, Number(limit) || 20);
  }

  @Post('orders/:orderId/confirm-refund')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ticketing.manage')
  confirmRefund(@Param('orderId') orderId: string) {
    return this.service.confirmRefund(orderId);
  }

  @Post('orders/:orderId/refund')
  refund(
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.requestRefund(orderId, user.id);
  }
}
