/** Red nije prenosiv na drugog korisnika nakon odjave ili promjene sesije. */
export function mediaOwnerMatches(ownerId: string): boolean {
  try {
    const user = JSON.parse(localStorage.getItem('fk_user') ?? 'null') as { id?: unknown } | null;
    return !!ownerId && user?.id === ownerId && !!localStorage.getItem('fk_access_token');
  } catch {
    return false;
  }
}

export class MediaSessionChanged extends Error {
  constructor() { super('Media upload session changed'); }
}
