import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import { mapLeagueSeasons, pickDefaultLeagueSeasonId } from '../../lib/league-season';
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

export type HomeExtras = {
  players: HomePlayerItem[];
  leagueRows: HomeLeagueRow[];
  gallery: HomeGalleryItem[];
  trophies: HomeTrophyItem[];
  sponsors: HomeSponsorItem[];
};

const emptyExtras: HomeExtras = {
  players: [],
  leagueRows: [],
  gallery: [],
  trophies: [],
  sponsors: [],
};

async function loadLeague(): Promise<HomeLeagueRow[]> {
  const [seasons, ownRes] = await Promise.all([
    api.get('/competitions/seasons/list'),
    api.get('/clubs/own').catch(() => ({ data: null })),
  ]);
  const seasons = mapLeagueSeasons(seasons.data);
  const seasonId = pickDefaultLeagueSeasonId(seasons);
  if (!seasonId) return [];
  const ownId = asString(asRecord(ownRes.data).id);
  const standings = await api.get('/statistics/standings', { params: { seasonId } });
  return asArray(standings.data)
    .slice(0, 5)
    .map((row, index) => {
      const item = asRecord(row);
      const id = asString(item.clubId, String(index));
      return {
        id,
        clubName: asString(item.clubName, `Tim ${index + 1}`),
        slug: asString(item.clubSlug) || undefined,
        points: Number(item.points ?? 0),
        position: index + 1,
        crestPath: asString(item.crestPath) || undefined,
        played: Number(item.played ?? 0),
        goalDifference: Number(item.goalDifference ?? 0),
        form: asString(item.form),
        isOwn: Boolean(ownId && id === ownId),
      };
    });
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

export async function loadHomeExtras(): Promise<HomeExtras> {
  const [players, leagueRows, gallery, trophies, sponsors] = await Promise.all([
    loadHomePlayers().catch(() => [] as HomePlayerItem[]),
    loadLeague().catch(() => [] as HomeLeagueRow[]),
    loadGallery().catch(() => [] as HomeGalleryItem[]),
    loadTrophies().catch(() => [] as HomeTrophyItem[]),
    loadSponsors().catch(() => [] as HomeSponsorItem[]),
  ]);
  return { players, leagueRows, gallery, trophies, sponsors };
}

export { emptyExtras };
