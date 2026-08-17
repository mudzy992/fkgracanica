export interface TicketCategory {
  id: string;
  label: string;
  price: number;
  isActive: boolean;
}

export interface TicketingSalesModes {
  boxOffice: boolean;
  online: boolean;
  onlineReady: boolean;
  readyProviders?: import('./payment-provider').PaymentProviderId[];
}

export interface TicketingPublicConfig {
  categories: TicketCategory[];
  stadiumCapacity: number;
  memberDiscountPercent: number;
  maxBoxOfficeTicketsPerUser: number;
  membershipAnnualPrice: number;
  activeTicketMatch: import('../types').Match | null;
  salesModes: TicketingSalesModes;
  onlineReady: boolean;
  readyProviders: import('./payment-provider').PaymentProviderId[];
  membershipOnlineEnabled: boolean;
  modulesTicketing: boolean;
  modulesMembership: boolean;
  ticketCardBackground: string | null;
  seasonPassPrice: number;
  seasonPassLabel: string;
  seasonPassAvailable: boolean;
}

export type ProviderGate = { keysOk: boolean; checkoutReady: boolean };

export interface TicketingAdminConfig {
  settings: Record<string, string>;
  salesModes: TicketingSalesModes;
  onlineReady: boolean;
  providerStatus: {
    stripe: ProviderGate;
    paypal: ProviderGate;
    monri: ProviderGate;
    defaultProvider: string;
  };
  categories: TicketCategory[];
}
