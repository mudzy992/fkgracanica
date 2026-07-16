/** Flatten facet search API into navigable list items. */
export type SearchNavItem = {
  id: string;
  title: string;
  type: string;
  slug?: string;
};

type FacetBucket = Record<string, unknown>;

function asItems(value: unknown): FacetBucket[] {
  return Array.isArray(value) ? (value as FacetBucket[]) : [];
}

function titleFrom(item: FacetBucket, fallback: string): string {
  if (typeof item.title === 'string' && item.title) return item.title;
  if (typeof item.name === 'string' && item.name) return item.name;
  const first = typeof item.firstName === 'string' ? item.firstName : '';
  const last = typeof item.lastName === 'string' ? item.lastName : '';
  const full = `${first} ${last}`.trim();
  if (full) return full;
  const home = (item.homeClub as { name?: string } | undefined)?.name;
  const away = (item.awayClub as { name?: string } | undefined)?.name;
  if (home && away) return `${home} vs ${away}`;
  return fallback;
}

export function flattenSearchResponse(data: unknown): SearchNavItem[] {
  if (!data || typeof data !== 'object') return [];
  const root = data as Record<string, unknown>;
  const out: SearchNavItem[] = [];
  const push = (type: string, items: FacetBucket[]) => {
    for (const item of items) {
      const id = typeof item.id === 'string' ? item.id : String(item.id ?? '');
      if (!id) continue;
      out.push({
        id,
        type,
        title: titleFrom(item, 'Rezultat'),
        slug: typeof item.slug === 'string' ? item.slug : undefined,
      });
    }
  };
  push('news', asItems(root.news));
  push('players', asItems(root.players));
  push('clubs', asItems(root.clubs));
  push('matches', asItems(root.matches));
  push('galleries', asItems(root.galleries));
  push('trophies', asItems(root.trophies));
  return out;
}

export function searchItemHref(item: SearchNavItem): string | null {
  switch (item.type) {
    case 'news':
      return item.slug ? `/(tabs)/news/${item.slug}` : null;
    case 'players':
      return `/player/${item.id}`;
    case 'galleries':
      return item.slug ? `/gallery/${item.slug}` : null;
    case 'matches':
      return `/(tabs)/live/${item.id}`;
    case 'clubs':
      return '/team';
    case 'trophies':
      return '/heritage';
    default:
      return null;
  }
}
