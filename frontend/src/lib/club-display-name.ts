import type { Club } from '../types';

type ClubLike = Pick<Club, 'name' | 'shortName'> | null | undefined;

export function clubShortName(club: ClubLike, maxLen = 4): string {
  const trimmed = club?.shortName?.trim();
  if (trimmed) return trimmed.toUpperCase();
  const name = club?.name?.trim() ?? '?';
  const word = name.split(/\s+/).find(Boolean) ?? name;
  return word.slice(0, maxLen).toUpperCase();
}
