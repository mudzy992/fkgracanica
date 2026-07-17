import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';

export type HomePlayerItem = {
  id: string;
  name: string;
  position: string;
  photoPath?: string;
};

export type HomeLeagueRow = {
  id: string;
  clubName: string;
  points: number;
  position: number;
};

export type HomeGalleryItem = {
  id: string;
  slug: string;
  title: string;
  coverPath?: string;
};

export type HomeTrophyItem = {
  id: string;
  year: string;
  name: string;
  competition?: string;
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

async function loadPlayers(): Promise<HomePlayerItem[]> {
  const { data } = await api.get('/clubs/own');
  const club = asRecord(data);
  const clubId = asString(club.id);
  if (!clubId) return [];
  const squad = await api.get(`/clubs/${clubId}/squad`);
  return asArray(squad.data)
    .slice(0, 4)
    .map((entry, index) => {
      const item = asRecord(entry);
      const player = asRecord(item.player);
      return {
        id: asString(player.id, String(index)),
        name:
          [asString(player.firstName), asString(player.lastName)].filter(Boolean).join(' ') ||
          asString(player.name, 'Igrač'),
        position: asString(player.position, 'Tim'),
        photoPath: asString(player.photoPath) || asString(player.imagePath),
      };
    });
}

async function loadLeague(): Promise<HomeLeagueRow[]> {
  const seasons = await api.get('/competitions/seasons/list');
  const seasonId = asString(asRecord(asArray(seasons.data)[0]).id);
  if (!seasonId) return [];
  const standings = await api.get('/statistics/standings', { params: { seasonId } });
  return asArray(standings.data)
    .slice(0, 5)
    .map((row, index) => {
      const item = asRecord(row);
      return {
        id: asString(item.clubId, String(index)),
        clubName: asString(item.clubName, `Tim ${index + 1}`),
        points: Number(item.points ?? 0),
        position: index + 1,
      };
    });
}

async function loadGallery(): Promise<HomeGalleryItem[]> {
  const { data } = await api.get('/gallery');
  return asArray(data)
    .slice(0, 2)
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
      };
    });
}

async function loadTrophies(): Promise<HomeTrophyItem[]> {
  const { data } = await api.get('/trophies');
  return asArray(data)
    .slice(0, 4)
    .map((item, index) => {
      const record = asRecord(item);
      return {
        id: asString(record.id, String(index)),
        year: asString(record.year, '—'),
        name: asString(record.name) || asString(record.title, 'Trofej'),
        competition: asString(record.competition) || undefined,
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
    loadPlayers().catch(() => [] as HomePlayerItem[]),
    loadLeague().catch(() => [] as HomeLeagueRow[]),
    loadGallery().catch(() => [] as HomeGalleryItem[]),
    loadTrophies().catch(() => [] as HomeTrophyItem[]),
    loadSponsors().catch(() => [] as HomeSponsorItem[]),
  ]);
  return { players, leagueRows, gallery, trophies, sponsors };
}

export { emptyExtras };
