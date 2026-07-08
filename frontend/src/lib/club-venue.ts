import type { Club } from '../types';

export function resolveClubVenue(club?: Pick<Club, 'stadium' | 'stadiumRel'> | null): string {
  return club?.stadiumRel?.name?.trim() || club?.stadium?.trim() || '';
}
