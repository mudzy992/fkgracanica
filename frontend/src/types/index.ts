export type ContentStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverPath?: string | null;
  status: ContentStatus;
  publishedAt?: string | null;
  createdAt: string;
  category?: { id: string; name: string; slug: string } | null;
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
  websiteUrl?: string | null;
  tier: string;
  sortOrder: number;
}

export interface Trophy {
  id: string;
  title: string;
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
  city?: string | null;
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
  minute: number;
  homeClub?: Club;
  awayClub?: Club;
  events?: MatchEvent[];
  lineups?: MatchLineup[];
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
}

export interface MuseumItem {
  id: string;
  title: string;
  description?: string | null;
  year?: number | null;
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
