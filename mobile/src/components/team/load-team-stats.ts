import { api } from '../../lib/api';
import {
  activeSeasonCompetitions,
  type ClubParticipation,
} from '../../lib/club-participation';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import type { TeamPlayer, TeamStanding, TeamTotals } from './load-team-screen';

export type TeamSeasonStatsData = {
  seasonName?: string;
  standing?: TeamStanding;
  totals?: TeamTotals;
  players: TeamPlayer[];
};

export function mapParticipations(data: unknown): ClubParticipation[] {
  return asArray(data)
    .map((row) => {
      const item = asRecord(row);
      return {
        seasonId: asString(item.seasonId),
        calendarSeasonId: asString(item.calendarSeasonId) || undefined,
        seasonName: asString(item.seasonName),
        yearStart: Number(item.yearStart ?? 0),
        isActive: Boolean(item.isActive),
        competitionId: asString(item.competitionId),
        competitionName: asString(item.competitionName, 'Takmičenje'),
        isLeague: Boolean(item.isLeague),
      };
    })
    .filter((p) => p.seasonId);
}

export function mapTeamSeasonStats(data: unknown): TeamSeasonStatsData {
  const root = asRecord(data);
  const standingRaw = asRecord(root.standing);
  const hasStanding =
    standingRaw.points != null || standingRaw.played != null || asString(standingRaw.clubId);
  const totalsRaw = asRecord(root.totals);
  const totals: TeamTotals | undefined =
    totalsRaw.goals != null || totalsRaw.appearances != null
      ? {
          goals: Number(totalsRaw.goals ?? 0),
          assists: Number(totalsRaw.assists ?? 0),
          appearances: Number(totalsRaw.appearances ?? 0),
          yellowCards: Number(totalsRaw.yellowCards ?? 0),
          redCards: Number(totalsRaw.redCards ?? 0),
        }
      : undefined;
  const standing: TeamStanding | undefined = hasStanding
    ? {
        played: Number(standingRaw.played ?? 0),
        won: Number(standingRaw.won ?? 0),
        drawn: Number(standingRaw.drawn ?? 0),
        lost: Number(standingRaw.lost ?? 0),
        points: Number(standingRaw.points ?? 0),
        goalsFor: Number(standingRaw.goalsFor ?? 0),
        goalsAgainst: Number(standingRaw.goalsAgainst ?? 0),
        form: asString(standingRaw.form),
      }
    : undefined;
  const players: TeamPlayer[] = asArray(root.players).map((row) => {
    const p = asRecord(row);
    const stats = asRecord(p.stats);
    return {
      id: asString(p.id),
      firstName: asString(p.firstName, 'Igrač'),
      lastName: asString(p.lastName),
      position: asString(p.position, 'MID'),
      number: Number.isFinite(Number(p.number)) ? Number(p.number) : undefined,
      goals: Number(stats.goals ?? 0) || 0,
      assists: Number(stats.assists ?? 0) || 0,
      appearances: Number(stats.appearances ?? 0) || 0,
      yellowCards: Number(stats.yellowCards ?? 0) || 0,
      redCards: Number(stats.redCards ?? 0) || 0,
      isBench: false,
    };
  }).filter((p) => p.id);
  return {
    seasonName: asString(asRecord(root.season).name) || undefined,
    standing,
    totals,
    players,
  };
}

export async function loadClubParticipations(clubId: string): Promise<ClubParticipation[]> {
  const { data } = await api.get(`/clubs/${clubId}/participations`);
  return activeSeasonCompetitions(mapParticipations(data));
}

export async function loadClubSeasonStats(
  clubId: string,
  editionId?: string,
): Promise<TeamSeasonStatsData> {
  const { data } = await api.get(`/clubs/${clubId}/stats`, {
    params: editionId ? { seasonId: editionId } : undefined,
  });
  return mapTeamSeasonStats(data);
}
