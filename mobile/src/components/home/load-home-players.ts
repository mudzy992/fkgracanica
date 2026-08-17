import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import { leagueEditionId, pickDefaultLeagueSeasonId, mapCalendarSeasons } from '../../lib/league-season';

export type HomePlayerItem = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  number?: number;
  photoPath?: string;
  goals: number;
};

export async function loadHomePlayers(): Promise<HomePlayerItem[]> {
  const [ownRes, seasonsRes] = await Promise.all([
    api.get('/clubs/own'),
    api.get('/seasons'),
  ]);
  const clubId = asString(asRecord(ownRes.data).id);
  if (!clubId) return [];
  const calendars = asArray(seasonsRes.data);
  const calendarId = pickDefaultLeagueSeasonId(mapCalendarSeasons(calendars));
  const calendar = calendars.find((row) => asString(asRecord(row).id) === calendarId);
  const seasonId = leagueEditionId(calendar);
  const [statsRes, playersRes] = await Promise.all([
    seasonId
      ? api.get(`/clubs/${clubId}/stats`, { params: { seasonId } })
      : Promise.resolve({ data: null }),
    api.get('/players', { params: { clubId, activeOnly: 'true' } }),
  ]);
  const photoById = new Map<string, string>();
  for (const entry of asArray(playersRes.data)) {
    const p = asRecord(entry);
    const id = asString(p.id);
    const path = asString(p.photoPath) || asString(p.imagePath);
    if (id && path) photoById.set(id, path);
  }
  const ranked = asArray(asRecord(statsRes.data).players)
    .map((entry, index) => mapPlayer(entry, index, photoById))
    .sort((a, b) => b.goals - a.goals || a.lastName.localeCompare(b.lastName));
  if (ranked.length > 0) return ranked.slice(0, 5);
  return asArray(playersRes.data)
    .slice(0, 5)
    .map((entry, index) => mapPlayer(entry, index, photoById));
}

function mapPlayer(
  entry: unknown,
  index: number,
  photoById: Map<string, string>,
): HomePlayerItem {
  const player = asRecord(entry);
  const stats = asRecord(player.stats);
  const id = asString(player.id, String(index));
  const rawNumber = Number(player.number);
  const goals = Number(stats.goals ?? player.goals ?? 0);
  return {
    id,
    firstName: asString(player.firstName) || asString(player.name, 'Igrač'),
    lastName: asString(player.lastName),
    position: asString(player.position, 'Tim'),
    number: Number.isFinite(rawNumber) && rawNumber > 0 ? rawNumber : undefined,
    photoPath: photoById.get(id) || asString(player.photoPath) || undefined,
    goals: Number.isFinite(goals) ? goals : 0,
  };
}
