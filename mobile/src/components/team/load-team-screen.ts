import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';

export type TeamPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  number?: number;
  photoPath?: string;
  goals: number;
  assists: number;
  appearances: number;
  yellowCards: number;
  redCards: number;
  isBench: boolean;
};

export type TeamPitchSlot = {
  key: string;
  left: number;
  top: number;
  player: TeamPlayer | null;
  lineRole: string;
};

export type TeamStanding = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  form: string;
};

export type TeamTotals = {
  goals: number;
  assists: number;
  appearances: number;
  yellowCards: number;
  redCards: number;
};

export type TeamScreenData = {
  clubId: string;
  clubName: string;
  crestPath?: string;
  city?: string;
  stadiumName?: string;
  formation?: string;
  starters: number;
  benchCount: number;
  seasonName?: string;
  standing?: TeamStanding;
  totals?: TeamTotals;
  players: TeamPlayer[];
  spotlight: TeamPlayer[];
  pitchSlots: TeamPitchSlot[];
};

const POS_ORDER = ['GK', 'DEF', 'MID', 'FWD'] as const;

export const POSITION_LABELS: Record<string, string> = {
  GK: 'Golman',
  DEF: 'Odbrana',
  MID: 'Vezni',
  FWD: 'Napadač',
};

export function groupTeamPlayers(players: TeamPlayer[]) {
  return POS_ORDER.map((position) => ({
    position,
    players: players.filter((p) => !p.isBench && p.position === position),
  })).filter((g) => g.players.length > 0);
}

function mapPitch(x: number, y: number) {
  return { left: y, top: 100 - x };
}

function mapPlayer(entry: unknown, statsById: Map<string, Record<string, unknown>>): TeamPlayer | null {
  const slot = asRecord(entry);
  const player = asRecord(slot.player);
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

export async function loadTeamScreen(): Promise<TeamScreenData> {
  const { data: own } = await api.get('/clubs/own');
  const club = asRecord(own);
  const clubId = asString(club.id);
  if (!clubId) throw new Error('no-club');
  const stadium = asRecord(club.stadiumRel);
  const [squadRes, statsRes] = await Promise.all([
    api.get(`/clubs/${clubId}/squad`),
    api.get(`/clubs/${clubId}/stats`).catch(() => ({ data: null })),
  ]);
  const squad = asRecord(squadRes.data);
  const formation = asRecord(squad.formation);
  const def = Number(formation.def ?? 0);
  const mid = Number(formation.mid ?? 0);
  const fwd = Number(formation.fwd ?? 0);
  const statsRoot = asRecord(statsRes.data);
  const statsById = new Map<string, Record<string, unknown>>();
  for (const row of asArray(statsRoot.players)) {
    const p = asRecord(row);
    const id = asString(p.id);
    if (id) statsById.set(id, asRecord(p.stats));
  }
  const rawSlots = asArray(squad.slots);
  let players = rawSlots
    .map((entry) => mapPlayer(entry, statsById))
    .filter((p): p is TeamPlayer => Boolean(p));
  if (players.length === 0) {
    const rosterRes = await api.get('/players', { params: { clubId, activeOnly: 'true' } });
    players = asArray(rosterRes.data)
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
  const standing = hasStanding
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
  const spotlight = [...players]
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, 3);
  return {
    clubId,
    clubName: asString(club.name, 'FK Gračanica'),
    crestPath: asString(club.crestPath) || asString(club.logoPath) || undefined,
    city: asString(stadium.city) || asString(club.city) || undefined,
    stadiumName: asString(stadium.name) || asString(club.stadium) || undefined,
    formation: def || mid || fwd ? `${def}-${mid}-${fwd}` : undefined,
    starters: players.filter((p) => !p.isBench).length,
    benchCount: players.filter((p) => p.isBench).length,
    seasonName: asString(asRecord(statsRoot.season).name) || undefined,
    standing,
    totals,
    players,
    spotlight,
    pitchSlots,
  };
}
