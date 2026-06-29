export interface CheckoutSessionResult {
  url: string;
  sessionId: string;
  provider: string;
}

export interface PaymentProvider {
  readonly id: string;
  isReady(): Promise<boolean>;
  createTicketCheckout(orderId: string, successUrl: string, cancelUrl: string): Promise<CheckoutSessionResult>;
  createMembershipCheckout(
    membershipId: string,
    amount: number,
    successUrl: string,
    cancelUrl: string,
  ): Promise<CheckoutSessionResult>;
}
