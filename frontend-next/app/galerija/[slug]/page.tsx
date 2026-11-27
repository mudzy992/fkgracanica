import type { Metadata } from 'next';
import Link from 'next/link';
import { getApiUrl, mediaUrl } from '../../../lib/media';

export const revalidate = 60;
export const dynamicParams = true;

type GalleryItem = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  photos?: { id: string; path: string; caption?: string | null }[];
};

async function getGallery(slug: string): Promise<GalleryItem | null> {
  try {
    const res = await fetch(`${getApiUrl()}/gallery/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return (await res.json()) as GalleryItem;
  } catch {}
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = await getGallery(slug);
  if (!g) return { title: 'Galerija — FK Gračanica' };
  return { title: g.title, description: g.description ?? undefined };
}

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getGallery(slug);

  if (!data) {
    return (
      <main className="min-h-screen bg-background p-12 text-center text-text">
        <p className="text-sm text-text-muted">P-NEXT-02c</p>
        <h1 className="font-display text-h1 font-bold">Album nije pronađen</h1>
        <p className="mt-4 text-text-muted">
          <code className="bg-surface-deep px-2 py-1 rounded">{slug}</code> — backend fallback.
        </p>
        <Link href="/galerija" className="mt-6 inline-block text-primary-light">
          ← Nazad na galeriju
        </Link>
      </main>
    );
  }

  const photos = data.photos ?? [];
  const cover = photos[0]?.path;

  return (
    <div className="min-h-screen bg-background pb-16 text-text">
      <div className="relative overflow-hidden border-b border-border bg-surface-deep">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(cover, 'medium') ?? ''} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <Link href="/galerija" className="mb-4 inline-block text-xs text-white/60">
            ← Galerija
          </Link>
          <h1 className="font-display text-display font-bold text-white">{data.title}</h1>
          <p className="mt-2 text-sm text-white/60">{photos.length} fotografija</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {data.description ? (
          <div className="glass-premium mb-10 rounded-2xl border border-border bg-surface p-6 text-text-muted">
            <div dangerouslySetInnerHTML={{ __html: data.description }} />
          </div>
        ) : null}

        {photos.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => {
              const url = mediaUrl(p.path, 'medium');
              return (
                <div key={p.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={p.caption ?? ''} className="h-64 w-full object-cover" />
                  ) : null}
                  {p.caption ? <p className="p-3 text-xs text-text-muted">{p.caption}</p> : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-12 text-center text-text-muted">Nema fotografija.</p>
        )}

        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02c · <code>/api/v1/gallery/slug/{data.slug}</code>
        </p>
      </div>
    </div>
  );
}
