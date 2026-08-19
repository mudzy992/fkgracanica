import type { FormMatchEntry } from '../lib/form-types';

export type ContentStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
export type MatchReportStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED';

export type MatchPeriod =
  | 'FIRST_HALF'
  | 'SECOND_HALF'
  | 'EXTRA_FIRST'
  | 'EXTRA_SECOND'
  | 'PENALTIES';

export type LiveBreak =
  | 'NONE'
  | 'REGULAR_HT'
  | 'ET_HT'
  | 'POST_REGULATION'
  | 'POST_EXTRA';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  permissions?: string[];
  notifyLiveMatch?: boolean;
  notifyPush?: boolean;
  notifyInApp?: boolean;
}

export interface StandingRow {
  clubId: string;
  clubName: string;
  clubSlug?: string;
  crestPath?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string;
  formMatches?: FormMatchEntry[];
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
  featured?: boolean;
}

export interface ClubTimelineEvent {
  id: string;
  year: number;
  title: string;
  description?: string | null;
  imagePath?: string | null;
  sortOrder?: number;
}

export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number?: number | null;
  position?: string | null;
  photoPath?: string | null;
  bio?: string | null;
  isActive: boolean;
  clubId?: string | null;
  club?: { id: string; name: string } | null;
}

export interface Club {
  id: string;
  name: string;
  slug?: string;
  shortName?: string | null;
  logoPath?: string | null;
  crestPath?: string | null;
  city?: string | null;
  stadium?: string | null;
  description?: string | null;
  isOwnClub?: boolean;
  formationDef?: number;
  formationMid?: number;
  formationFwd?: number;
  stadiumRel?: import('./club-hub').Stadium | null;
}

export interface CompetitionRound {
  id: string;
  seasonId: string;
  number: number;
  name?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  _count?: { matches: number };
}

export interface Match {
  id: string;
  seasonId: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  round?: number | null;
  roundId?: string | null;
  roundRel?: Pick<CompetitionRound, 'id' | 'number' | 'name'> | null;
  scheduledAt: string;
  venue?: string | null;
  status: MatchStatus;
  reportStatus?: MatchReportStatus;
  youtubeUrl?: string | null;
  liveStreamUrl?: string | null;
  highlights?: MatchHighlight[];
  minute: number;
  clockStartedAt?: string | null;
  matchPeriod?: MatchPeriod | null;
  liveBreak?: LiveBreak;
  stoppageFirstHalf?: number;
  stoppageSecondHalf?: number;
  stoppageExtraFirst?: number;
  stoppageExtraSecond?: number;
  penaltyHomeScore?: number;
  penaltyAwayScore?: number;
  homeClub?: Club;
  awayClub?: Club;
  events?: MatchEvent[];
  lineups?: MatchLineup[];
  lineup?: MatchLineup[];
  liveComments?: LiveComment[];
  season?: { name: string; competition?: { name: string } };
}

export interface MatchHighlight {
  id: string;
  matchId: string;
  title: string;
  youtubeUrl: string;
  startSeconds?: number | null;
  sortOrder: number;
}

export interface MatchEvent {
  id: string;
  type: string;
  minute: number;
  playerId?: string | null;
  teamSide?: string | null;
  description?: string | null;
  player?: Player | null;
  relatedPlayerId?: string | null;
  relatedPlayer?: Player | null;
}

export interface MatchLineup {
  id: string;
  clubId: string;
  playerId: string;
  positionX?: number | null;
  positionY?: number | null;
  isStarter: boolean;
  player?: Player;
}

export interface LiveComment {
  id: string;
  message: string;
  minute?: number | null;
  createdAt: string;
  userId?: string | null;
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
  pendingNews: number;
  pendingGalleries: number;
  pendingLive: number;
  pendingMemberships: number;
  unreadInbox: number;
  uniqueVisitorsWeb: number;
  uniqueVisitorsMobile: number;
  uniqueVisitorsTotal30d: number;
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
