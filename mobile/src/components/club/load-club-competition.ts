import { api } from '../../lib/api';
import { asRecord, asString } from '../../lib/content-helpers';
import type { HomeLeagueRow } from '../home/load-home-extras';
import { mapLeagueMatches, type LeagueMatchItem } from '../league/load-league-screen';
import { mapStandingsRows } from '../league/map-standings';

export type ClubCompetitionData = {
  standings: HomeLeagueRow[];
  matches: LeagueMatchItem[];
};

export async function loadClubCompetition(
  clubId: string,
  seasonId: string,
): Promise<ClubCompetitionData> {
  const [ownRes, standingsRes, matchesRes] = await Promise.all([
    api.get('/clubs/own').catch(() => ({ data: null })),
    api.get('/statistics/standings', { params: { seasonId } }),
    api.get('/matches', { params: { seasonId } }),
  ]);
  const ownId = asString(asRecord(ownRes.data).id);
  const standings = mapStandingsRows(standingsRes.data, { ownId, highlightId: clubId });
  const matches = mapLeagueMatches(matchesRes.data).filter(
    (m) => m.homeId === clubId || m.awayId === clubId,
  );
  return { standings, matches };
}
