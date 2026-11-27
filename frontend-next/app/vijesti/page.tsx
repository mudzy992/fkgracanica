import type { Metadata } from 'next';
import { VijestiClient } from './VijestiClient';
import { getApiUrl } from '../../lib/media';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Vijesti',
  description: 'Najnovije vijesti, izvještaji i obavještenja FK Gračanica',
};

type NewsCategory = { id: string; name: string; slug: string };
type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverPath?: string | null;
  publishedAt?: string | null;
  categoryId?: string | null;
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function getCategories(): Promise<NewsCategory[]> {
  const data = await fetchJson<NewsCategory[] | { data: NewsCategory[] }>(
    `${getApiUrl()}/news-categories`,
  );
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data && 'data' in data) {
    const d = (data as { data: unknown }).data;
    if (Array.isArray(d)) return d as NewsCategory[];
    if (d && typeof d === 'object' && 'items' in (d as Record<string, unknown>)) {
      const items = (d as { items: unknown }).items;
      if (Array.isArray(items)) return items as NewsCategory[];
    }
  }
  return [];
}

async function getPublishedNews(): Promise<NewsItem[]> {
  const data = await fetchJson<NewsItem[] | { data: NewsItem[] }>(
    `${getApiUrl()}/news/published`,
  );
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'data' in data) {
    const inner = (data as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as NewsItem[];
  }
  return [];
}

export default async function VijestiPage() {
  const [categories, news] = await Promise.all([getCategories(), getPublishedNews()]);

  // Fallback kad API nije dostupan (build bez backend-a)
  if (categories.length === 0 && news.length === 0) {
    return (
      <main className="min-h-screen bg-background text-text">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <header className="mb-8 rounded-2xl border border-border bg-surface p-8 shadow-sm">
            <p className="text-xs font-mono text-text-muted">P-NEXT-02b</p>
            <h1 className="font-display text-display font-bold tracking-tight">Vijesti</h1>
            <p className="mt-3 max-w-3xl text-body text-text-muted">
              Najnovije vijesti FK Gračanica — Next.js ISR (60s). Backend nije dostupan u
              build-u, pa je prikazan fallback. U runtime-u povući će se podaci sa{' '}
              <code className="bg-surface-deep px-1 py-0.5 rounded">/api/v1/news/published</code> i{' '}
              <code className="bg-surface-deep px-1 py-0.5 rounded">/api/v1/news-categories</code>.
            </p>
            <p className="mt-4 text-xs font-mono text-text-muted">
              {categories.length} kategorija · {news.length} vijesti · revalidate 60s
            </p>
          </header>
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-muted">
            Nema podataka — pokreni backend i osvježi.
            <br />
            <span className="text-xs">
              Vite ostaje na <code>www</code>, Next je na <code>next-preview</code> na{' '}
              <code>/vijesti</code>.
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="pb-16">
        <div className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
            <p className="text-xs font-mono text-text-muted">P-NEXT-02b · ISR 60s</p>
            <h1 className="font-display text-display font-bold tracking-tight">Vijesti</h1>
            <p className="mt-3 max-w-3xl text-text-muted">
              Najnovije vijesti, izvještaji i obavještenja kluba.
            </p>
            <p className="mt-2 text-xs font-mono text-text-muted">
              {news.length} vijesti · {categories.length} kategorija · revalidate 60s
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <VijestiClient initialNews={news} categories={categories} />
          <footer className="mt-12 rounded-xl border border-border bg-surface-deep p-4 text-center text-xs text-text-muted">
            Vite ostaje na <code>www/vijesti</code>, Next je na <code>next-preview/vijesti</code> — paritet verifikovan.
          </footer>
        </div>
      </div>
    </main>
  );
}
