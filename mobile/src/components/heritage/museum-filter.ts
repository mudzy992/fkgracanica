import type { HeritageItem } from './load-heritage';

export function museumYears(items: HeritageItem[]): number[] {
  const set = new Set<number>();
  items.forEach((item) => item.year != null && set.add(item.year));
  return [...set].sort((a, b) => b - a);
}

export function museumCategories(items: HeritageItem[]): string[] {
  const set = new Set<string>();
  items.forEach((item) => item.category && set.add(item.category));
  return [...set].sort();
}

export function filterMuseum(
  items: HeritageItem[],
  year?: number,
  category?: string,
): HeritageItem[] {
  return items.filter((item) => {
    if (year != null && item.year !== year) return false;
    if (category && item.category !== category) return false;
    return true;
  });
}

export function splitFeaturedMuseum(items: HeritageItem[]): {
  featured: HeritageItem | null;
  rest: HeritageItem[];
} {
  if (!items.length) return { featured: null, rest: [] };
  const featured =
    items.find((item) => item.featured) ?? items.find((item) => item.imagePath) ?? items[0];
  return { featured, rest: items.filter((item) => item.id !== featured.id) };
}
