import type { HeritageItem } from './load-heritage';

export function splitFeaturedTrophy(items: HeritageItem[]): {
  featured: HeritageItem | null;
  rest: HeritageItem[];
} {
  if (!items.length) return { featured: null, rest: [] };
  const featured =
    items.find((item) => item.featured) ?? items.find((item) => item.imagePath && item.description) ?? items[0];
  return { featured, rest: items.filter((item) => item.id !== featured.id) };
}

export function sortStoryChapters(items: HeritageItem[]): HeritageItem[] {
  return [...items].sort((a, b) => (a.year ?? 0) - (b.year ?? 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function extractYears(years?: string): string[] {
  if (!years) return [];
  return years.match(/\d{4}/g) ?? [];
}

export function groupHofByYear(items: HeritageItem[]): { year: string; items: HeritageItem[] }[] {
  const map = new Map<string, HeritageItem[]>();
  for (const item of items) {
    const year = extractYears(item.years)[0] ?? '';
    const bucket = map.get(year) ?? [];
    bucket.push(item);
    map.set(year, bucket);
  }
  return [...map.entries()]
    .map(([year, groupItems]) => ({
      year,
      items: [...groupItems].sort((a, b) => a.title.localeCompare(b.title, 'bs')),
    }))
    .sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0) || b.year.localeCompare(a.year));
}

const MUSEUM_I18N: Record<string, string> = {
  artifact: 'museumArtifact',
  photo: 'museumPhoto',
  jersey: 'museumJersey',
  trophy: 'museumTrophy',
  document: 'museumDocument',
  other: 'museumOther',
};

export function museumCategoryKey(value?: string): string {
  if (!value) return 'museumOther';
  return MUSEUM_I18N[value.toLowerCase()] ?? 'museumOther';
}
