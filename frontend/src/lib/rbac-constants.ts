export const SYSTEM_ROLES = ['Administrator', 'Moderator', 'Writer', 'Komentator', 'Član'] as const;

export function isSystemRole(name: string): boolean {
  return (SYSTEM_ROLES as readonly string[]).includes(name);
}
