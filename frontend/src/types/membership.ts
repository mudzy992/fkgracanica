export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED';

export interface MembershipCard {
  id: string;
  cardNumber: string;
  qrCode: string;
  issuedAt: string;
}

export interface MembershipUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface MembershipRow {
  id: string;
  status: MembershipStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: MembershipUser;
  card?: MembershipCard | null;
}
