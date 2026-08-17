import { BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import type { CheckoutSessionResult } from './providers/payment-provider.interface';

export async function createSimpleStripeCheckout(
  stripe: Stripe,
  input: {
    amount: number;
    name: string;
    successUrl: string;
    cancelUrl: string;
    metadata: Record<string, string>;
  },
): Promise<CheckoutSessionResult> {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'bam',
          unit_amount: Math.round(input.amount * 100),
          product_data: { name: input.name },
        },
      },
    ],
    metadata: input.metadata,
  });
  if (!session.url) throw new BadRequestException('Stripe session nije kreiran');
  return { url: session.url, sessionId: session.id, provider: 'stripe' };
}
