import { Injectable, NotImplementedException } from '@nestjs/common';
import type { CheckoutSessionResult, PaymentProvider } from './payment-provider.interface';

@Injectable()
export class PaypalProvider implements PaymentProvider {
  readonly id = 'paypal';

  isReady() {
    return Promise.resolve(false);
  }

  createTicketCheckout(): Promise<CheckoutSessionResult> {
    throw new NotImplementedException('PayPal integracija u pripremi');
  }

  createMembershipCheckout(): Promise<CheckoutSessionResult> {
    throw new NotImplementedException('PayPal integracija u pripremi');
  }
}
