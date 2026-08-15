import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import type { HomeLeagueRow } from '../home/load-home-extras';

export type LeagueSeasonOption = { id: string; name: string };

export type LeagueMatchItem = {
  id: string;
  homeName: string;
  awayName: string;
  meta: string;
  status: string;
  scheduledAt: string;
};

export type LeagueLeaderItem = {
  playerId: string;
  name: string;
  value: number;
};

export type LeagueScreenData = {
  seasons: LeagueSeasonOption[];
  seasonId: string;
  seasonName: string;
  standings: HomeLeagueRow[];
  matches: LeagueMatchItem[];
  scorers: LeagueLeaderItem[];
  assists: LeagueLeaderItem[];
  teamCount: number;
  roundsPlayed: number;
  leaderName?: string;
  leaderPoints?: number;
  leaderCrestPath?: string;
};

function mapStandings(rows: unknown[], ownId: string): HomeLeagueRow[] {
  return asArray(rows).map((row, index) => {
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

function mapLeaders(rows: unknown[]): LeagueLeaderItem[] {
  return asArray(rows)
    .slice(0, 8)
    .map((row) => {
      const item = asRecord(row);
      return {
        playerId: asString(item.playerId),
        name: `${asString(item.firstName)} ${asString(item.lastName)}`.trim(),
        value: Number(item.value ?? 0),
      };
    })
    .filter((r) => r.playerId);
}

function mapMatches(rows: unknown[]): LeagueMatchItem[] {
  return asArray(rows).map((match, index) => {
    const item = asRecord(match);
    const home = asRecord(item.homeClub);
    const away = asRecord(item.awayClub);
    const status = asString(item.status);
    const live = status === 'LIVE' || status === 'HALFTIME';
    return {
      id: asString(item.id, String(index)),
      homeName: asString(home.name, 'Domaći'),
      awayName: asString(away.name, 'Gosti'),
      status,
      scheduledAt: asString(item.scheduledAt),
      meta: live
        ? `${asString(item.homeScore, '0')} : ${asString(item.awayScore, '0')} · ${asString(item.minute, '0')}'`
        : status === 'FINISHED'
          ? `${asString(item.homeScore, '0')} : ${asString(item.awayScore, '0')}`
          : asString(item.scheduledAt),
    };
  });
}

function roundsPlayed(matches: unknown[]): number {
  let max = 0;
  for (const match of asArray(matches)) {
    const item = asRecord(match);
    if (asString(item.status) !== 'FINISHED') continue;
    const roundRel = asRecord(item.roundRel);
    const n = Number(roundRel.number ?? item.round ?? 0);
    if (n > max) max = n;
  }
  return max;
}

export async function loadLeagueScreen(seasonId?: string): Promise<LeagueScreenData> {
  const [seasonsRes, ownRes] = await Promise.all([
    api.get('/competitions/seasons/list'),
    api.get('/clubs/own').catch(() => ({ data: null })),
  ]);
  const seasons = asArray(seasonsRes.data).map((entry) => {
    const s = asRecord(entry);
    return { id: asString(s.id), name: asString(s.name, 'Sezona') };
  }).filter((s) => s.id);
  const activeId = seasonId && seasons.some((s) => s.id === seasonId) ? seasonId : seasons[0]?.id ?? '';
  const seasonName = seasons.find((s) => s.id === activeId)?.name ?? '';
  const ownId = asString(asRecord(ownRes.data).id);
  if (!activeId) {
    return {
      seasons,
      seasonId: '',
      seasonName,
      standings: [],
      matches: [],
      scorers: [],
      assists: [],
      teamCount: 0,
      roundsPlayed: 0,
    };
  }
  const [standingsRes, matchesRes, scorersRes, assistsRes] = await Promise.all([
    api.get('/statistics/standings', { params: { seasonId: activeId } }),
    api.get('/matches', { params: { seasonId: activeId } }),
    api.get('/statistics/top-scorers', { params: { seasonId: activeId } }),
    api.get('/statistics/top-assists', { params: { seasonId: activeId } }),
  ]);
  const standings = mapStandings(standingsRes.data, ownId);
  const matches = mapMatches(matchesRes.data);
  const leader = standings[0];
  return {
    seasons,
    seasonId: activeId,
    seasonName,
    standings,
    matches,
    scorers: mapLeaders(scorersRes.data),
    assists: mapLeaders(assistsRes.data),
    teamCount: standings.length,
    roundsPlayed: roundsPlayed(matchesRes.data),
    leaderName: leader?.clubName,
    leaderPoints: leader?.points,
    leaderCrestPath: leader?.crestPath,
  };
}
