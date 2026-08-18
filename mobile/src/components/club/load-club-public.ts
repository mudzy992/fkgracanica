import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import type {
  TeamPitchSlot,
  TeamPlayer,
  TeamScreenData,
  TeamStanding,
  TeamTotals,
} from '../team/load-team-screen';

export type ClubStadiumInfo = {
  name: string;
  city?: string;
  address?: string;
  capacity?: number;
  description?: string;
};

export type ClubParticipation = {
  seasonId: string;
  label: string;
  yearStart: number;
  isActive: boolean;
  isLeague: boolean;
};

export type ClubPublicData = TeamScreenData & {
  isOwnClub: boolean;
  clubId: string;
  stadium?: ClubStadiumInfo;
  participations: ClubParticipation[];
};

function mapPitch(x: number, y: number) {
  return { left: y, top: 100 - x };
}

function mapPlayer(entry: unknown, statsById: Map<string, Record<string, unknown>>): TeamPlayer | null {
  const slot = asRecord(entry);
  const player = asRecord(slot.player ?? entry);
  const id = asString(player.id);
  if (!id) return null;
  const stats = statsById.get(id) ?? {};
  const rawNumber = Number(player.number);
  return {
    id,
    firstName: asString(player.firstName) || asString(player.name, 'Igrač'),
    lastName: asString(player.lastName),
    position: asString(player.position, 'MID'),
    number: Number.isFinite(rawNumber) && rawNumber > 0 ? rawNumber : undefined,
    photoPath: asString(player.photoPath) || asString(player.imagePath) || undefined,
    goals: Number(stats.goals ?? 0) || 0,
    assists: Number(stats.assists ?? 0) || 0,
    appearances: Number(stats.appearances ?? 0) || 0,
    yellowCards: Number(stats.yellowCards ?? 0) || 0,
    redCards: Number(stats.redCards ?? 0) || 0,
    isBench: Boolean(slot.isBench),
  };
}

function buildStatsMap(statsRoot: Record<string, unknown>) {
  const statsById = new Map<string, Record<string, unknown>>();
  for (const row of asArray(statsRoot.players)) {
    const p = asRecord(row);
    const id = asString(p.id);
    if (id) statsById.set(id, asRecord(p.stats));
  }
  return statsById;
}

export async function loadClubPublic(slug: string): Promise<ClubPublicData> {
  const { data } = await api.get(`/clubs/public/${encodeURIComponent(slug)}`);
  const root = asRecord(data);
  const club = asRecord(root.club);
  const stadiumRaw = asRecord(root.stadium);
  const squad = asRecord(root.squad);
  const statsRoot = asRecord(root.seasonStats);
  const formation = asRecord(squad.formation);
  const def = Number(formation.def ?? 0);
  const mid = Number(formation.mid ?? 0);
  const fwd = Number(formation.fwd ?? 0);
  const statsById = buildStatsMap(statsRoot);
  const rawSlots = asArray(squad.slots);
  let players = rawSlots
    .map((entry) => mapPlayer(entry, statsById))
    .filter((p): p is TeamPlayer => Boolean(p));
  if (players.length === 0) {
    players = asArray(root.players)
      .map((entry) => mapPlayer({ player: entry, isBench: false }, statsById))
      .filter((p): p is TeamPlayer => Boolean(p));
  }
  const byId = new Map(players.map((p) => [p.id, p]));
  const pitchSlots: TeamPitchSlot[] = rawSlots
    .filter((entry) => !Boolean(asRecord(entry).isBench))
    .map((entry, index) => {
      const slot = asRecord(entry);
      const mapped = mapPitch(Number(slot.positionX ?? 50), Number(slot.positionY ?? 50));
      const pid = asString(asRecord(slot.player).id);
      return {
        key: asString(slot.id, String(index)),
        left: mapped.left,
        top: mapped.top,
        player: pid ? byId.get(pid) ?? null : null,
        lineRole: asString(slot.lineRole, 'MID'),
      };
    });
  const standingRaw = asRecord(statsRoot.standing);
  const hasStanding =
    standingRaw.points != null || standingRaw.played != null || asString(standingRaw.clubId);
  const totalsRaw = asRecord(statsRoot.totals);
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
  const stadiumName = asString(stadiumRaw.name) || asString(club.stadium) || undefined;
  const city = asString(stadiumRaw.city) || asString(club.city) || undefined;
  const stadium: ClubStadiumInfo | undefined = stadiumName
    ? {
        name: stadiumName,
        city,
        address: asString(stadiumRaw.address) || undefined,
        capacity: Number.isFinite(Number(stadiumRaw.capacity))
          ? Number(stadiumRaw.capacity)
          : undefined,
        description: asString(stadiumRaw.description) || asString(club.description) || undefined,
      }
    : undefined;
  const spotlight = [...players]
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, 3);
  const participations: ClubParticipation[] = asArray(root.participations)
    .map((row) => {
      const item = asRecord(row);
      const seasonId = asString(item.seasonId);
      const competitionName = asString(item.competitionName, 'Takmičenje');
      const seasonName = asString(item.seasonName);
      return {
        seasonId,
        label: seasonName ? `${competitionName} (${seasonName})` : competitionName,
        yearStart: Number(item.yearStart ?? 0),
        isActive: Boolean(item.isActive),
        isLeague: Boolean(item.isLeague),
      };
    })
    .filter((p) => p.seasonId);
  return {
    isOwnClub: Boolean(club.isOwnClub),
    clubId: asString(club.id),
    clubName: asString(club.name, 'Klub'),
    crestPath: asString(club.crestPath) || asString(club.logoPath) || undefined,
    city,
    stadiumName,
    stadium,
    formation: def || mid || fwd ? `${def}-${mid}-${fwd}` : undefined,
    starters: players.filter((p) => !p.isBench).length,
    benchCount: players.filter((p) => p.isBench).length,
    seasonName: asString(asRecord(statsRoot.season).name) || undefined,
    standing,
    totals,
    players,
    spotlight,
    pitchSlots,
    participations,
  };
}
