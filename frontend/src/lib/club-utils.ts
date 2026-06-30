import type { Club, StandingRow } from '../types';

export function clubCrestPath(club?: Pick<Club, 'crestPath' | 'logoPath'> | null) {
  return club?.crestPath ?? club?.logoPath ?? null;
}

export function standingRowClub(row: Pick<StandingRow, 'clubName' | 'crestPath'>) {
  return { name: row.clubName, crestPath: row.crestPath };
}
