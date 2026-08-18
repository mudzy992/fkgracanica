import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import { leagueEditionId, mapCalendarSeasons, pickDefaultLeagueSeasonId } from '../../lib/league-season';
import { mapStandingsRows } from '../league/map-standings';
import { loadHomePlayers, type HomePlayerItem } from './load-home-players';

export type { HomePlayerItem };

export type HomeLeagueRow = {
  id: string;
  clubName: string;
  slug?: string;
  points: number;
  position: number;
  crestPath?: string;
  played: number;
  goalDifference: number;
  form: string;
  isOwn: boolean;
  isHighlight?: boolean;
};

export type HomeGalleryItem = {
  id: string;
  slug: string;
  title: string;
  coverPath?: string;
  photoCount: number;
};

export type HomeTrophyItem = {
  id: string;
  year: string;
  name: string;
  competition?: string;
  imagePath?: string;
  featured: boolean;
};

export type HomeSponsorItem = {
  id: string;
  name: string;
  logoPath?: string;
  url?: string;
};

export type HomeTimelineItem = {
  id: string;
  year?: number;
  title: string;
  imagePath?: string;
};

export type HomeExtras = {
  players: HomePlayerItem[];
  leagueRows: HomeLeagueRow[];
  gallery: HomeGalleryItem[];
  trophies: HomeTrophyItem[];
  sponsors: HomeSponsorItem[];
  timeline: HomeTimelineItem[];
};

const emptyExtras: HomeExtras = {
  players: [],
  leagueRows: [],
  gallery: [],
  trophies: [],
  sponsors: [],
  timeline: [],
};

async function loadLeague(): Promise<HomeLeagueRow[]> {
  const [seasonsRes, ownRes] = await Promise.all([
    api.get('/seasons'),
    api.get('/clubs/own').catch(() => ({ data: null })),
  ]);
  const calendars = asArray(seasonsRes.data);
  const seasons = mapCalendarSeasons(calendars);
  const calendarId = pickDefaultLeagueSeasonId(seasons);
  const calendar = calendars.find((row) => asString(asRecord(row).id) === calendarId);
  const seasonId = leagueEditionId(calendar);
  if (!seasonId) return [];
  const ownId = asString(asRecord(ownRes.data).id);
  const standings = await api.get('/statistics/standings', { params: { seasonId } });
  return mapStandingsRows(standings.data, { ownId }).slice(0, 5);
}

async function loadGallery(): Promise<HomeGalleryItem[]> {
  const { data } = await api.get('/gallery');
  return asArray(data)
    .slice(0, 3)
    .map((item, index) => {
      const record = asRecord(item);
      const photos = asArray(record.photos);
      const first = asRecord(photos[0]);
      return {
        id: asString(record.id, String(index)),
        slug: asString(record.slug),
        title: asString(record.title, 'Album'),
        coverPath:
          asString(record.coverPath) ||
          asString(record.heroPath) ||
          asString(first.path) ||
          asString(first.imagePath),
        photoCount: photos.length || Number(record.photoCount ?? 0),
      };
    });
}

async function loadTrophies(): Promise<HomeTrophyItem[]> {
  const { data } = await api.get('/trophies');
  return asArray(data)
    .slice(0, 6)
    .map((item, index) => {
      const record = asRecord(item);
      return {
        id: asString(record.id, String(index)),
        year: asString(record.year, '—'),
        name: asString(record.name) || asString(record.title, 'Trofej'),
        competition: asString(record.competition) || undefined,
        imagePath: asString(record.imagePath) || undefined,
        featured: Boolean(record.featured),
      };
    });
}

async function loadSponsors(): Promise<HomeSponsorItem[]> {
  const { data } = await api.get('/sponsors');
  return asArray(data)
    .slice(0, 6)
    .map((item, index) => {
      const record = asRecord(item);
      return {
        id: asString(record.id, String(index)),
        name: asString(record.name, 'Sponzor'),
        logoPath: asString(record.logoPath) || undefined,
        url: asString(record.url) || undefined,
      };
    });
}

function asYear(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

async function loadTimeline(): Promise<HomeTimelineItem[]> {
  const { data } = await api.get('/club-timeline');
  return asArray(data)
    .map((item, index) => {
      const record = asRecord(item);
      return {
        id: asString(record.id, String(index)),
        year: asYear(record.year),
        title: asString(record.title, '—'),
        imagePath: asString(record.imagePath) || asString(record.photoPath) || undefined,
      };
    })
    .filter((item) => Boolean(item.imagePath))
    .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
    .slice(0, 3);
}

export async function loadHomeExtras(): Promise<HomeExtras> {
  const [players, leagueRows, gallery, trophies, sponsors, timeline] = await Promise.all([
    loadHomePlayers().catch(() => [] as HomePlayerItem[]),
    loadLeague().catch(() => [] as HomeLeagueRow[]),
    loadGallery().catch(() => [] as HomeGalleryItem[]),
    loadTrophies().catch(() => [] as HomeTrophyItem[]),
    loadSponsors().catch(() => [] as HomeSponsorItem[]),
    loadTimeline().catch(() => [] as HomeTimelineItem[]),
  ]);
  return { players, leagueRows, gallery, trophies, sponsors, timeline };
}

export { emptyExtras };
