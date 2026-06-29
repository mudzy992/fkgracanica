export type TicketPaymentIntent = 'box_office' | 'online';

export type TicketStatus =
  | 'RESERVED'
  | 'PAID_AT_BOX_OFFICE'
  | 'USED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded';

export interface TicketMatch {
  id: string;
  scheduledAt?: string;
  homeClub?: { name: string };
  awayClub?: { name: string };
}

export interface TicketRow {
  id: string;
  category: string;
  price: string | number;
  qrCode: string;
  status: TicketStatus;
  matchId?: string;
  match?: TicketMatch;
}

export interface TicketOrderRow {
  id: string;
  status: OrderStatus | string;
  total: string | number;
  createdAt?: string;
  user?: { id?: string; email?: string; firstName?: string | null; lastName?: string | null };
  tickets?: TicketRow[];
  payment?: { status: string; method?: string };
}

export interface MatchAvailability {
  matchId: string;
  capacity: number;
  sold: number;
  remaining: number;
  memberDiscountPercent: number;
  userTickets: number;
  maxPerUser: number | null;
  userRemainingQuota: number | null;
  unlimitedPerUser: boolean;
  onlineUnlimited?: boolean;
  salesModes?: { boxOffice: boolean; online: boolean };
}
