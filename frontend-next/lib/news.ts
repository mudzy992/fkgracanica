import { getApiUrl } from './media';

export type NewsDetail = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverPath?: string | null;
  videoUrl?: string | null;
  seoTitle?: string | null;
  seoDesc?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  category?: { id: string; name: string; slug: string } | null;
  gallery?: { photos?: { id: string; path: string; caption?: string | null }[] } | null;
  relatedPlayers?: { player: { id: string; firstName: string; lastName: string } }[];
};

export async function getNewsBySlug(slug: string): Promise<NewsDetail | null> {
  const base = getApiUrl();
  for (const url of [
    `${base}/news/slug/${encodeURIComponent(slug)}`,
    `${base}/news/${encodeURIComponent(slug)}`,
  ]) {
    try {
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) return (await res.json()) as NewsDetail;
    } catch {
      // try next url
    }
  }
  return null;
}
