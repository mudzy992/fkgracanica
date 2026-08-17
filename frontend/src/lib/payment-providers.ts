import type { PaymentProviderId } from '../types/payment-provider';
import type { TicketingPublicConfig } from '../types/ticketing-config';

export function parsePaymentProvider(raw: string | null): PaymentProviderId | undefined {
  if (raw === 'stripe' || raw === 'paypal' || raw === 'monri') return raw;
  return undefined;
}

export function getReadyPaymentProviders(config?: TicketingPublicConfig): PaymentProviderId[] {
  if (config?.readyProviders?.length) return config.readyProviders;
  if (config?.salesModes?.online && config.onlineReady) return ['stripe'];
  return [];
}
