import { Injectable, NotImplementedException } from '@nestjs/common';
import type { CheckoutSessionResult, PaymentProvider } from './payment-provider.interface';

@Injectable()
export class MonriProvider implements PaymentProvider {
  readonly id = 'monri';

  isReady() {
    return Promise.resolve(false);
  }

  createTicketCheckout(): Promise<CheckoutSessionResult> {
    throw new NotImplementedException('Monri integracija u pripremi');
  }

  createMembershipCheckout(): Promise<CheckoutSessionResult> {
    throw new NotImplementedException('Monri integracija u pripremi');
  }
}
