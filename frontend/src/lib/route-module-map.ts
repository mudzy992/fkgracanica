/** Javna ruta → settings ključ modula (null = uvijek dostupno). */
const PUBLIC_ROUTE_MODULES: [string, string][] = [
  ['/vijesti', 'modules.news'],
  ['/galerija', 'modules.gallery'],
  ['/o-klubu', 'modules.timeline'],
  ['/tim', 'modules.clubs'],
  ['/klub', 'modules.clubs'],
  ['/igrac', 'modules.clubs'],
  ['/liga', 'modules.competitions'],
  ['/utakmice', 'modules.competitions'],
  ['/sponzori', 'modules.sponsors'],
  ['/trofeji', 'modules.trophies'],
  ['/hall-of-fame', 'modules.hallOfFame'],
  ['/muzej', 'modules.museum'],
  ['/ulaznice', 'modules.ticketing'],
  ['/clanstvo', 'feature.membership'],
  ['/kontakt', 'modules.contact'],
  ['/p', 'modules.cms'],
  ['/live', 'feature.live'],
];

/** Admin ruta → settings ključ modula (null = uvijek vidljivo). */
const ADMIN_ROUTE_MODULES: [string, string][] = [
  ['/admin/cms', 'modules.cms'],
  ['/admin/media', 'modules.media'],
  ['/admin/news', 'modules.news'],
  ['/admin/gallery', 'modules.gallery'],
  ['/admin/sponsors', 'modules.sponsors'],
  ['/admin/trophies', 'modules.trophies'],
  ['/admin/club-timeline', 'modules.timeline'],
  ['/admin/clubs', 'modules.clubs'],
  ['/admin/competitions', 'modules.competitions'],
  ['/admin/live', 'feature.live'],
  ['/admin/membership', 'feature.membership'],
  ['/admin/ticketing', 'modules.ticketing'],
  ['/admin/contact', 'modules.contact'],
  ['/admin/newsletter', 'modules.newsletter'],
  ['/admin/heritage', 'modules.hallOfFame'],
  ['/admin/comms', 'modules.contact'],
  ['/admin/hall-of-fame', 'modules.hallOfFame'],
  ['/admin/museum', 'modules.museum'],
];

function resolveModuleKey(path: string, rules: [string, string][]): string | null {
  const match = rules.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  return match?.[1] ?? null;
}

export function resolvePublicModuleKey(pathname: string): string | null {
  return resolveModuleKey(pathname, PUBLIC_ROUTE_MODULES);
}

export function resolveAdminModuleKey(path: string): string | null {
  return resolveModuleKey(path, ADMIN_ROUTE_MODULES);
}

/** Filtrira nav stavke (fallback ili CMS) po uključenim modulima. */
export function filterPathsByModule<T extends { to: string }>(
  items: T[],
  values: Record<string, string> | undefined,
  isEnabled: (values: Record<string, string> | undefined, key: string) => boolean,
): T[] {
  return items.filter((item) => {
    if (item.to.startsWith('http')) return true;
    const moduleKey = resolvePublicModuleKey(item.to);
    if (!moduleKey) return true;
    return isEnabled(values, moduleKey);
  });
}
