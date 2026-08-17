export type PaymentProviderId = 'stripe' | 'paypal' | 'monri';

/** Checkout implementiran u kodu. */
export const CHECKOUT_IMPLEMENTED: readonly PaymentProviderId[] = ['stripe', 'paypal', 'monri'];

export type ProviderGate = { keysOk: boolean; checkoutReady: boolean };

export function isCheckoutImplemented(id: PaymentProviderId) {
  return CHECKOUT_IMPLEMENTED.includes(id);
}

export function toProviderGate(id: PaymentProviderId, keysOk: boolean): ProviderGate {
  return { keysOk, checkoutReady: keysOk && isCheckoutImplemented(id) };
}
