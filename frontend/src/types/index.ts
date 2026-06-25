export type ContentStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
export type MatchReportStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  permissions?: string[];
}

export interface StandingRow {
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string;
}

export interface NewsComment {
  id: string;
  content: string;
  newsId: string;
  userId: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'> | null;
}

export interface NewsTag {
  id: string;
  name: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverPath?: string | null;
  videoUrl?: string | null;
  galleryId?: string | null;
  seoTitle?: string | null;
  seoDesc?: string | null;
  scheduledAt?: string | null;
  status: ContentStatus;
  publishedAt?: string | null;
  createdAt: string;
  categoryId?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  tags?: NewsTag[];
  gallery?: GalleryItem | null;
  relatedMatches?: { matchId?: string; match?: Match }[];
  relatedPlayers?: { player: Player }[];
}

export interface GalleryItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  status: ContentStatus;
  photos?: GalleryPhoto[];
}

export interface GalleryPhoto {
  id: string;
  path: string;
  caption?: string | null;
  sortOrder: number;
}

export interface Sponsor {
  id: string;
  name: string;
  logoPath?: string | null;
  url?: string | null;
  tier: string;
  sortOrder: number;
}

export interface Trophy {
  id: string;
  name: string;
  year: number;
  competition?: string | null;
  imagePath?: string | null;
  description?: string | null;
}

export interface ClubTimelineEvent {
  id: string;
  year: number;
  title: string;
  description?: string | null;
  imagePath?: string | null;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number?: number | null;
  position?: string | null;
  photoPath?: string | null;
  bio?: string | null;
  isActive: boolean;
}

export interface Club {
  id: string;
  name: string;
  shortName?: string | null;
  logoPath?: string | null;
  crestPath?: string | null;
  city?: string | null;
  stadium?: string | null;
  isOwnClub?: boolean;
}

export interface Match {
  id: string;
  seasonId: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  round?: number | null;
  scheduledAt: string;
  venue?: string | null;
  status: MatchStatus;
  reportStatus?: MatchReportStatus;
  youtubeUrl?: string | null;
  minute: number;
  homeClub?: Club;
  awayClub?: Club;
  events?: MatchEvent[];
  lineups?: MatchLineup[];
  lineup?: MatchLineup[];
}

export interface MatchEvent {
  id: string;
  type: string;
  minute: number;
  playerId?: string | null;
  description?: string | null;
  player?: Player | null;
}

export interface MatchLineup {
  id: string;
  playerId: string;
  positionX?: number | null;
  positionY?: number | null;
  isStarter: boolean;
  player?: Player;
}

export interface LiveComment {
  id: string;
  content: string;
  minute: number;
  createdAt: string;
}

export interface HallOfFameEntry {
  id: string;
  name: string;
  role?: string | null;
  years?: string | null;
  bio?: string | null;
  photoPath?: string | null;
  imagePath?: string | null;
}

export interface MuseumItem {
  id: string;
  title: string;
  description?: string | null;
  year?: number | null;
  category?: string;
  imagePath?: string | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardKpis {
  users: number;
  members: number;
  activeMemberships: number;
  publishedNews: number;
  matches: number;
  goals: number;
  ticketsSold: number;
}

export interface SearchResults {
  news: NewsItem[];
  players: Player[];
  matches: Match[];
}

export interface SettingEntry {
  key: string;
  value: string;
  description?: string;
}
