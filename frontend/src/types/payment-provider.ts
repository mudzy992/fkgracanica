export type PaymentProviderId = 'stripe' | 'paypal' | 'monri';

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProviderId, string> = {
  stripe: 'Stripe',
  paypal: 'PayPal',
  monri: 'Monri',
};
