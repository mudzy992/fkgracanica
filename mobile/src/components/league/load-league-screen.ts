import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import { leagueEditionId, mapCalendarSeasons, pickDefaultLeagueSeasonId } from '../../lib/league-season';
import type { HomeLeagueRow } from '../home/load-home-extras';
import { mapStandingsRows } from './map-standings';

export type LeagueSeasonOption = { id: string; name: string };

export type LeagueRoundOption = { id: string; number: number; name: string };

export type LeagueMatchItem = {
  id: string;
  homeName: string;
  awayName: string;
  homeId?: string;
  awayId?: string;
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
  rounds: LeagueRoundOption[];
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

export function mapLeagueMatches(rows: unknown[]): LeagueMatchItem[] {
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
      homeId: asString(home.id) || undefined,
      awayId: asString(away.id) || undefined,
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

function mapRounds(rows: unknown[]): LeagueRoundOption[] {
  return asArray(rows)
    .map((row) => {
      const item = asRecord(row);
      const number = Number(item.number ?? 0);
      return {
        id: asString(item.id),
        number,
        name: asString(item.name) || String(number),
      };
    })
    .filter((r) => r.id && r.number > 0)
    .sort((a, b) => a.number - b.number);
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

const empty = (seasons: LeagueSeasonOption[], seasonName: string): LeagueScreenData => ({
  seasons,
  seasonId: '',
  seasonName,
  rounds: [],
  standings: [],
  matches: [],
  scorers: [],
  assists: [],
  teamCount: 0,
  roundsPlayed: 0,
});

export async function loadLeagueScreen(
  seasonId?: string,
  upToRound?: number | null,
): Promise<LeagueScreenData> {
  const [seasonsRes, ownRes] = await Promise.all([
    api.get('/seasons'),
    api.get('/clubs/own').catch(() => ({ data: null })),
  ]);
  const calendars = asArray(seasonsRes.data);
  const seasons = mapCalendarSeasons(calendars);
  const activeId = pickDefaultLeagueSeasonId(seasons, seasonId);
  const calendar = calendars.find((row) => asString(asRecord(row).id) === activeId);
  const seasonName = seasons.find((s) => s.id === activeId)?.name ?? '';
  const ownId = asString(asRecord(ownRes.data).id);
  const editionId = leagueEditionId(calendar);
  if (!editionId) return empty(seasons, seasonName);
  const params = { seasonId: editionId, ...(upToRound != null ? { upToRound } : {}) };
  const [standingsRes, matchesRes, scorersRes, assistsRes, roundsRes] = await Promise.all([
    api.get('/statistics/standings', { params }),
    api.get('/matches', { params: { seasonId: editionId } }),
    api.get('/statistics/top-scorers', { params: { seasonId: editionId } }),
    api.get('/statistics/top-assists', { params: { seasonId: editionId } }),
    api.get('/rounds', { params: { seasonId: editionId } }).catch(() => ({ data: [] })),
  ]);
  const standings = mapStandingsRows(standingsRes.data, { ownId });
  const leader = standings[0];
  return {
    seasons,
    seasonId: activeId,
    seasonName,
    rounds: mapRounds(roundsRes.data),
    standings,
    matches: mapLeagueMatches(matchesRes.data),
    scorers: mapLeaders(scorersRes.data),
    assists: mapLeaders(assistsRes.data),
    teamCount: standings.length,
    roundsPlayed: roundsPlayed(matchesRes.data),
    leaderName: leader?.clubName,
    leaderPoints: leader?.points,
    leaderCrestPath: leader?.crestPath,
  };
}
