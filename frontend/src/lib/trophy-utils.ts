import type { Trophy } from '../types';

export function pickFeaturedTrophy(trophies: Trophy[]): Trophy | null {
  if (!trophies.length) return null;
  return (
    trophies.find((t) => t.featured) ??
    trophies.find((t) => t.imagePath && t.description) ??
    trophies[0]
  );
}

export function splitFeaturedTrophy(trophies: Trophy[]) {
  const featured = pickFeaturedTrophy(trophies);
  const rest = featured ? trophies.filter((t) => t.id !== featured.id) : trophies;
  return { featured, rest };
}
