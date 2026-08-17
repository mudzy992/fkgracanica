export type StaffHomeKind = 'admin' | 'moderator' | 'commentator' | 'writer';

/** Admin → moderator → komentator → writer. Član ne ulazi u /admin. */
export function resolveStaffHome(permissions?: string[]): StaffHomeKind {
  const p = permissions ?? [];
  if (p.includes('settings.read') || p.includes('users.read')) return 'admin';
  if (p.includes('news.approve') || p.includes('gallery.approve') || p.includes('live.approve')) {
    return 'moderator';
  }
  if (p.includes('live.manage')) return 'commentator';
  return 'writer';
}
