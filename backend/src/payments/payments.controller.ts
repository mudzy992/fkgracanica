import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post('checkout/tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  checkoutTickets(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      orderId: string;
      successUrl: string;
      cancelUrl: string;
      provider?: 'stripe' | 'paypal' | 'monri';
    },
  ) {
    return this.service.checkoutTickets(
      body.orderId,
      body.successUrl,
      body.cancelUrl,
      user.id,
      body.provider,
    );
  }

  @Post('checkout/membership')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  checkoutMembership(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      membershipId: string;
      amount: number;
      successUrl: string;
      cancelUrl: string;
      provider?: 'stripe' | 'paypal' | 'monri';
    },
  ) {
    return this.service.checkoutMembership(
      body.membershipId,
      body.amount,
      body.successUrl,
      body.cancelUrl,
      user.id,
      body.provider,
    );
  }

  @Post('membership/confirm-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  confirmMembershipSession(
    @CurrentUser() user: AuthUser,
    @Body() body: { sessionId: string },
  ) {
    return this.service.confirmMembershipSession(body.sessionId, user.id);
  }

  @Post('tickets/confirm-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  confirmTicketSession(
    @CurrentUser() user: AuthUser,
    @Body() body: { sessionId: string },
  ) {
    return this.service.confirmTicketSession(body.sessionId, user.id);
  }

  @Post('webhooks/stripe')
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const raw = req.rawBody ?? Buffer.from('');
    return this.service.handleStripeWebhook(raw, signature ?? '');
  }
}
