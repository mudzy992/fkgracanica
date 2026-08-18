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
  videoUrl?: string | null;
};

export type Club = {
  id: string;
  name: string;
  shortName?: string | null;
  crestPath?: string | null;
};

export type CmsPageSection = {
  id: string;
  widgetType: string;
  sortOrder: number;
  config: Record<string, unknown>;
  enabled: boolean;
};

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  sections?: CmsPageSection[];
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
  highlights?: MatchHighlight[];
  season?: { name: string; competition?: { name?: string } | null };
  roundRel?: { number: number; name?: string | null } | null;
};

export type MatchHighlight = {
  id: string;
  title: string;
  youtubeUrl: string;
  startSeconds?: number | null;
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
  readyProviders?: string[];
  onlineReady?: boolean;
  membershipAnnualPrice?: number;
  membershipOnlineEnabled?: boolean;
  seasonPassPrice?: number;
  seasonPassLabel?: string;
  seasonPassAvailable?: boolean;
  activeTicketMatch?: Match | null;
};

export type SeasonPassMine = {
  offer: {
    season: { id: string; name: string } | null;
    price: number;
    label: string;
    available: boolean;
    salesModes: { boxOffice: boolean; online: boolean };
  };
  pass: {
    id: string;
    status: string;
    label: string;
    price: string;
    qrCode: string;
    season?: { name: string };
  } | null;
};

export type NewsComment = {
  id: string;
  content: string;
  newsId: string;
  userId: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'> | null;
};
