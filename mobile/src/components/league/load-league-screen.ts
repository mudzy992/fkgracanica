import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import {
  mapCalendarEditions,
  mapCalendarSeasons,
  pickDefaultEditionId,
  pickDefaultLeagueSeasonId,
  type LeagueEditionChip,
} from '../../lib/league-season';
import type { HomeLeagueRow } from '../home/load-home-extras';
import { mapLeaders, mapRounds, roundsPlayed } from './map-league-lists';
import { mapStandingsRows } from './map-standings';

export type LeagueSeasonOption = { id: string; name: string };

export type LeagueRoundOption = { id: string; number: number; name: string };

export type LeagueMatchItem = {
  id: string;
  homeName: string;
  awayName: string;
  homeId?: string;
  awayId?: string;
  homeCrestPath?: string;
  awayCrestPath?: string;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
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
  editions: LeagueEditionChip[];
  editionId: string;
  competitionName?: string;
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
    const homeScore = Number(item.homeScore ?? 0);
    const awayScore = Number(item.awayScore ?? 0);
    const minute = Number(item.minute ?? 0);
    return {
      id: asString(item.id, String(index)),
      homeName: asString(home.name, 'Domaći'),
      awayName: asString(away.name, 'Gosti'),
      homeId: asString(home.id) || undefined,
      awayId: asString(away.id) || undefined,
      homeCrestPath: asString(home.crestPath) || undefined,
      awayCrestPath: asString(away.crestPath) || undefined,
      homeScore,
      awayScore,
      minute,
      status,
      scheduledAt: asString(item.scheduledAt),
      meta: live
        ? `${homeScore} : ${awayScore} · ${minute}'`
        : status === 'FINISHED'
          ? `${homeScore} : ${awayScore}`
          : asString(item.scheduledAt),
    };
  });
}

const empty = (seasons: LeagueSeasonOption[], seasonName: string): LeagueScreenData => ({
  seasons,
  seasonId: '',
  seasonName,
  editions: [],
  editionId: '',
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
  editionId?: string,
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
  const editions = mapCalendarEditions(calendar);
  const resolvedEdition = pickDefaultEditionId(editions, editionId);
  const ownId = asString(asRecord(ownRes.data).id);
  if (!resolvedEdition) return empty(seasons, seasonName);
  const params = { seasonId: resolvedEdition, ...(upToRound != null ? { upToRound } : {}) };
  const [standingsRes, matchesRes, scorersRes, assistsRes, roundsRes] = await Promise.all([
    api.get('/statistics/standings', { params }),
    api.get('/matches', { params: { seasonId: resolvedEdition } }),
    api.get('/statistics/top-scorers', { params: { seasonId: resolvedEdition } }),
    api.get('/statistics/top-assists', { params: { seasonId: resolvedEdition } }),
    api.get('/rounds', { params: { seasonId: resolvedEdition } }).catch(() => ({ data: [] })),
  ]);
  const standings = mapStandingsRows(standingsRes.data, { ownId });
  const leader = standings[0];
  return {
    seasons,
    seasonId: activeId,
    seasonName,
    editions,
    editionId: resolvedEdition,
    competitionName: editions.find((e) => e.id === resolvedEdition)?.name,
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
