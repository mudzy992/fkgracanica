export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  permissions?: string[];
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = AuthTokens & { user: User };

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverPath: string | null;
  publishedAt: string | null;
  createdAt: string;
  category?: { id: string; name: string; slug: string } | null;
};

export type Club = {
  id: string;
  name: string;
  shortName?: string | null;
};

export type Match = {
  id: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  scheduledAt: string;
  venue: string | null;
  status: string;
  minute: number;
  homeClub: Club;
  awayClub: Club;
  events?: MatchEvent[];
};

export type MatchEvent = {
  id: string;
  type: string;
  minute: number;
  description?: string | null;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  type: string;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type MembershipCard = {
  id: string;
  cardNumber: string;
  qrCode: string;
  issuedAt: string;
};

export type Membership = {
  id: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  card: MembershipCard | null;
};

export type Ticket = {
  id: string;
  matchId: string;
  category: string;
  price: string;
  qrCode: string;
  status: string;
};

export type TicketOrder = {
  id: string;
  status: string;
  createdAt: string;
  tickets: Ticket[];
};

export type TicketCategory = {
  id: string;
  label: string;
  price: number;
  isActive: boolean;
};

export type MatchAvailability = {
  matchId: string;
  capacity: number;
  sold: number;
  remaining: number;
  memberDiscountPercent: number;
  userTickets: number;
  maxPerUser: number | null;
  userRemainingQuota: number | null;
  salesModes?: { boxOffice: boolean; online: boolean };
};

export type TicketingConfig = {
  categories: TicketCategory[];
  salesModes?: { boxOffice: boolean; online: boolean };
};

export type NewsComment = {
  id: string;
  content: string;
  newsId: string;
  userId: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'> | null;
};
