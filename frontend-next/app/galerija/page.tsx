import type { Metadata } from 'next';
import Link from 'next/link';
import { getApiUrl, mediaUrl } from '../../lib/media';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Galerija',
  description: 'Foto galerije i albumi FK Gračanica',
};

type GalleryItem = {
  id: string;
  title: string;
  slug: string;
  photos?: { id: string; path: string }[];
};

async function getGalleries(): Promise<GalleryItem[]> {
  try {
    const res = await fetch(`${getApiUrl()}/gallery?status=PUBLISHED`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data))
      return (data as { data: GalleryItem[] }).data;
    return [];
  } catch {
    return [];
  }
}

export default async function GalerijaPage() {
  const items = await getGalleries();

  if (!items.length) {
    return (
      <main className="min-h-screen bg-background text-text">
        <div className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <p className="text-xs font-mono text-text-muted">P-NEXT-02c · ISR 60s</p>
            <h1 className="font-display text-display font-bold">Galerija</h1>
            <p className="mt-2 text-text-muted">Foto galerije kluba.</p>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center text-text-muted">
          Nema galerija — backend nije dostupan (fallback).
          <br />
          <span className="text-xs">GET /api/v1/gallery?status=PUBLISHED</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02c · ISR 60s · {items.length} albuma</p>
          <h1 className="font-display text-display font-bold tracking-tight">Galerija</h1>
          <p className="mt-3 text-text-muted">Foto galerije i albumi kluba.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((g, i) => {
            const cover = g.photos?.[0]?.path;
            const src = cover ? mediaUrl(cover, 'medium') : undefined;
            const count = g.photos?.length ?? 0;
            const span =
              i % 6 === 0
                ? 'col-span-2 row-span-2 min-h-[200px]'
                : i % 6 === 3
                  ? 'col-span-1 row-span-2 min-h-[200px]'
                  : 'min-h-[120px]';
            return (
              <Link
                key={g.id}
                href={`/galerija/${g.slug}`}
                className={`group relative block overflow-hidden rounded-2xl border border-border bg-surface-deep ${span}`}
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm">{g.title}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                {count > 0 ? (
                  <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white/80">
                    {count} 📷
                  </span>
                ) : null}
                <p className="absolute bottom-0 p-4 text-sm font-bold uppercase text-white group-hover:text-primary-light">
                  {g.title}
                </p>
              </Link>
            );
          })}
        </div>
        <footer className="mt-10 text-center text-xs text-text-muted">
          Vite na <code>www/galerija</code> · Next na <code>next-preview/galerija</code>
        </footer>
      </div>
    </main>
  );
}
