import { asArray, asRecord, asString } from '../../lib/content-helpers';

export type WriterCategory = { id: string; name: string };
export type EntityHit = { id: string; label: string };

export type WriterArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  categoryId: string | null;
  coverPath: string | null;
  videoUrl: string;
  tagsCsv: string;
  seoTitle: string;
  seoDesc: string;
  scheduledAt: string;
  gallery: EntityHit | null;
  relatedPlayers: EntityHit[];
  relatedMatches: EntityHit[];
};

export function emptyWriterArticle(): WriterArticle {
  return {
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'DRAFT',
    categoryId: null,
    coverPath: null,
    videoUrl: '',
    tagsCsv: '',
    seoTitle: '',
    seoDesc: '',
    scheduledAt: '',
    gallery: null,
    relatedPlayers: [],
    relatedMatches: [],
  };
}

function playerLabel(raw: unknown): EntityHit {
  const r = asRecord(raw);
  const name = [asString(r.firstName), asString(r.lastName)].filter(Boolean).join(' ');
  return { id: asString(r.id), label: name || asString(r.id, '—') };
}

function matchLabel(raw: unknown): EntityHit {
  const r = asRecord(raw);
  const home = asString(asRecord(r.homeClub).name, '?');
  const away = asString(asRecord(r.awayClub).name, '?');
  const date = asString(r.scheduledAt).slice(0, 10);
  return { id: asString(r.id), label: date ? `${home} vs ${away} · ${date}` : `${home} vs ${away}` };
}

export function mapWriterArticle(raw: unknown): WriterArticle {
  const r = asRecord(raw);
  const tags = asArray(r.tags).map((tag) => asString(asRecord(tag).name)).filter(Boolean);
  const gallery = asRecord(r.gallery);
  const galleryId = asString(r.galleryId || gallery.id);
  return {
    id: asString(r.id),
    title: asString(r.title),
    slug: asString(r.slug),
    excerpt: asString(r.excerpt),
    content: asString(r.content),
    status: asString(r.status, 'DRAFT'),
    categoryId: asString(r.categoryId) || null,
    coverPath: asString(r.coverPath) || null,
    videoUrl: asString(r.videoUrl),
    tagsCsv: tags.join(', '),
    seoTitle: asString(r.seoTitle),
    seoDesc: asString(r.seoDesc),
    scheduledAt: asString(r.scheduledAt).slice(0, 16),
    gallery: galleryId ? { id: galleryId, label: asString(gallery.title, galleryId) } : null,
    relatedPlayers: asArray(r.relatedPlayers).map((row) => playerLabel(asRecord(row).player)),
    relatedMatches: asArray(r.relatedMatches).map((row) => matchLabel(asRecord(row).match)),
  };
}

export function writerWritePayload(article: WriterArticle): Record<string, unknown> {
  const tags = article.tagsCsv.split(',').map((t) => t.trim()).filter(Boolean);
  return {
    title: article.title.trim(),
    slug: article.slug.trim() || undefined,
    excerpt: article.excerpt.trim() || undefined,
    content: article.content.trim() || '<p></p>',
    categoryId: article.categoryId || undefined,
    coverPath: article.coverPath || undefined,
    videoUrl: article.videoUrl.trim() || undefined,
    tags,
    seoTitle: article.seoTitle.trim() || undefined,
    seoDesc: article.seoDesc.trim() || undefined,
    scheduledAt: article.scheduledAt.trim() || null,
    galleryId: article.gallery?.id || null,
    relatedPlayerIds: article.relatedPlayers.map((p) => p.id),
    relatedMatchIds: article.relatedMatches.map((m) => m.id),
  };
}
