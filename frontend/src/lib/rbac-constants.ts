export const SYSTEM_ROLES = ['Administrator', 'Moderator', 'Writer', 'Komentator', 'Redar', 'Član'] as const;

export function isSystemRole(name: string): boolean {
  return (SYSTEM_ROLES as readonly string[]).includes(name);
}
