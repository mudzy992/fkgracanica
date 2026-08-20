import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';

export type HeritageTab = 'sponsors' | 'trophies' | 'timeline' | 'hall' | 'museum';

const HERITAGE_TABS: HeritageTab[] = ['sponsors', 'trophies', 'timeline', 'hall', 'museum'];

export function parseHeritageTab(value?: string): HeritageTab {
  return HERITAGE_TABS.includes(value as HeritageTab) ? (value as HeritageTab) : 'timeline';
}

export type HeritageItem = {
  id: string;
  title: string;
  subtitle?: string;
  imagePath?: string;
  tier?: string;
  year?: number;
  description?: string;
  featured?: boolean;
  category?: string;
  role?: string;
  competition?: string;
  url?: string;
  sortOrder?: number;
  years?: string;
};

export type HeritageData = Record<HeritageTab, HeritageItem[]>;

function asLabel(value: unknown): string {
  if (typeof value === 'string' && value) return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function asYear(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function mapRow(raw: unknown, index: number, titleKeys: string[]): HeritageItem {
  const item = asRecord(raw);
  return {
    id: asString(item.id, String(index)),
    title: titleKeys.map((key) => asLabel(item[key])).find(Boolean) ?? '—',
    subtitle: asLabel(item.tier) || asLabel(item.role) || asLabel(item.years) || asLabel(item.category),
    imagePath: asString(item.logoPath) || asString(item.imagePath) || asString(item.photoPath) || undefined,
    tier: asString(item.tier) || undefined,
    year: asYear(item.year),
    description: asString(item.description) || asString(item.bio) || undefined,
    featured: item.featured === true,
    category: asString(item.category) || undefined,
    role: asString(item.role) || undefined,
    competition: asString(item.competition) || undefined,
    url: asString(item.url) || undefined,
    sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : undefined,
    years: asString(item.years) || undefined,
  };
}

export async function loadHeritage(): Promise<HeritageData> {
  const [sponsors, trophies, timeline, hall, museum] = await Promise.all([
    api.get('/sponsors'),
    api.get('/trophies'),
    api.get('/club-timeline'),
    api.get('/hall-of-fame'),
    api.get('/museum'),
  ]);
  return {
    sponsors: asArray(sponsors.data).map((row, i) => mapRow(row, i, ['name'])),
    trophies: asArray(trophies.data).map((row, i) => mapRow(row, i, ['name', 'title'])),
    timeline: asArray(timeline.data).map((row, i) => mapRow(row, i, ['title'])),
    hall: asArray(hall.data).map((row, i) => mapRow(row, i, ['name'])),
    museum: asArray(museum.data).map((row, i) => mapRow(row, i, ['title', 'name'])),
  };
}
