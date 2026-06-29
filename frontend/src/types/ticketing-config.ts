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
}

export interface TicketingAdminConfig {
  settings: Record<string, string>;
  salesModes: TicketingSalesModes;
  onlineReady: boolean;
  providerStatus: {
    stripe: boolean;
    paypal: boolean;
    monri: boolean;
    defaultProvider: string;
  };
  categories: TicketCategory[];
}
