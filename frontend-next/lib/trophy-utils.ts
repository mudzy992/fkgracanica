export type Trophy = {
  id: string;
  name: string;
  year: number;
  competition?: string | null;
  imagePath?: string | null;
  description?: string | null;
  featured?: boolean;
};

export function splitFeaturedTrophy(trophies: Trophy[]) {
  if (!trophies.length) return { featured: null, rest: [] as Trophy[] };
  const featured =
    trophies.find((t) => t.featured) ??
    trophies.find((t) => t.imagePath && t.description) ??
    trophies[0];
  const rest = trophies.filter((t) => t.id !== featured.id);
  return { featured, rest };
}
