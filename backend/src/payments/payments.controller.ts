import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Redirect,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user.type';
import { buildMobileReturnUrl } from './mobile-return.util';

import { Public } from '../common/decorators/public.decorator';
@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get('mobile-return')
  @Public()
  @Redirect()
  mobileReturn(
    @Query()
    query: {
      to?: string;
      kind?: string;
      paid?: string;
      cancelled?: string;
      session_id?: string;
      provider?: string;
    },
  ) {
    return { url: buildMobileReturnUrl(query), statusCode: 302 };
  }

  @Post('checkout/tickets')
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

  @Post('checkout/season-pass')
  @ApiBearerAuth()
  checkoutSeasonPass(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      passId: string;
      successUrl: string;
      cancelUrl: string;
      provider?: 'stripe' | 'paypal' | 'monri';
    },
  ) {
    return this.service.checkoutSeasonPass(
      body.passId,
      body.successUrl,
      body.cancelUrl,
      user.id,
      body.provider,
    );
  }

  @Post('membership/confirm-session')
  @ApiBearerAuth()
  confirmMembershipSession(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      sessionId: string;
      provider?: 'stripe' | 'paypal' | 'monri';
      returnUrl?: string;
    },
  ) {
    return this.service.confirmMembershipSession(
      body.sessionId,
      user.id,
      body.provider,
      body.returnUrl,
    );
  }

  @Post('tickets/confirm-session')
  @ApiBearerAuth()
  confirmTicketSession(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      sessionId: string;
      provider?: 'stripe' | 'paypal' | 'monri';
      returnUrl?: string;
    },
  ) {
    return this.service.confirmTicketSession(
      body.sessionId,
      user.id,
      body.provider,
      body.returnUrl,
    );
  }

  @Post('season-pass/confirm-session')
  @ApiBearerAuth()
  confirmSeasonPassSession(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      sessionId: string;
      provider?: 'stripe' | 'paypal' | 'monri';
      returnUrl?: string;
    },
  ) {
    return this.service.confirmSeasonPassSession(
      body.sessionId,
      user.id,
      body.provider,
      body.returnUrl,
    );
  }

  @Post('webhooks/stripe')
  @Public()
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const raw = req.rawBody ?? Buffer.from('');
    return this.service.handleStripeWebhook(raw, signature ?? '');
  }

  @Post('webhooks/paypal')
  @Public()
  paypalWebhook(@Req() req: RawBodyRequest<Request>) {
    const raw = req.rawBody ?? Buffer.from('');
    return this.service.handlePaypalWebhook(raw, req.headers);
  }

  @Get('monri/form')
  @ApiBearerAuth()
  getMonriForm(
    @CurrentUser() user: AuthUser,
    @Query('sessionId') sessionId: string,
    @Query('origin') origin: string,
  ) {
    return this.service.getMonriForm(sessionId, user.id, origin || '');
  }

  @Post('webhooks/monri')
  @Public()
  monriWebhook(@Req() req: RawBodyRequest<Request>) {
    const raw = req.rawBody ?? Buffer.from('');
    return this.service.handleMonriWebhook(raw, req.headers);
  }
}
