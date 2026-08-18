import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import type { NewsItem } from '../../types/api';

export type NewsPhoto = { id: string; path?: string };
export type NewsRelatedMatch = { id: string; label: string };
export type NewsRelatedPlayer = { id: string; name: string };

export type NewsDetail = NewsItem & {
  videoUrl?: string;
  photos: NewsPhoto[];
  relatedMatches: NewsRelatedMatch[];
  relatedPlayers: NewsRelatedPlayer[];
};

function mapPhotos(raw: unknown): NewsPhoto[] {
  const gallery = asRecord(raw);
  const photos = asArray(gallery.photos).length ? asArray(gallery.photos) : asArray(raw);
  return photos.map((photo, index) => {
    const item = asRecord(photo);
    return {
      id: asString(item.id, String(index)),
      path: asString(item.path) || asString(item.imagePath) || undefined,
    };
  });
}

function mapMatches(raw: unknown): NewsRelatedMatch[] {
  return asArray(raw).flatMap((row) => {
    const rel = asRecord(row);
    const match = asRecord(rel.match);
    const id = asString(match.id) || asString(rel.matchId);
    if (!id) return [];
    const home = asString(asRecord(match.homeClub).name);
    const away = asString(asRecord(match.awayClub).name);
    return [{ id, label: home && away ? `${home} vs ${away}` : id }];
  });
}

function mapPlayers(raw: unknown): NewsRelatedPlayer[] {
  return asArray(raw).flatMap((row) => {
    const rel = asRecord(row);
    const player = asRecord(rel.player);
    const id = asString(player.id) || asString(rel.playerId);
    if (!id) return [];
    const name =
      `${asString(player.firstName)} ${asString(player.lastName)}`.trim() || asString(player.name, id);
    return [{ id, name }];
  });
}

export function mapNewsDetail(raw: unknown): NewsDetail {
  const record = asRecord(raw);
  const category = asRecord(record.category);
  return {
    id: asString(record.id),
    title: asString(record.title),
    slug: asString(record.slug),
    excerpt: asString(record.excerpt) || null,
    content: asString(record.content),
    coverPath: asString(record.coverPath) || null,
    publishedAt: asString(record.publishedAt) || null,
    createdAt: asString(record.createdAt),
    videoUrl: asString(record.videoUrl) || undefined,
    category: asString(category.id)
      ? { id: asString(category.id), name: asString(category.name), slug: asString(category.slug) }
      : null,
    photos: mapPhotos(record.gallery),
    relatedMatches: mapMatches(record.relatedMatches),
    relatedPlayers: mapPlayers(record.relatedPlayers),
  };
}

export async function fetchNewsDetail(slug: string): Promise<NewsDetail> {
  const { data } = await api.get(`/news/slug/${slug}`);
  return mapNewsDetail(data);
}
