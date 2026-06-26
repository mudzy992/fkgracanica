import type { Club } from '../types';

export function clubCrestPath(club?: Pick<Club, 'crestPath' | 'logoPath'> | null) {
  return club?.crestPath ?? club?.logoPath ?? null;
}
