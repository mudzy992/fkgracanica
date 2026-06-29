/** Korisnik s barem jednom dozvolom (admin, moderator, writer, komentator…). Član ima prazan permissions. */
export function hasStaffAccess(permissions?: string[]): boolean {
  return (permissions?.length ?? 0) > 0;
}
