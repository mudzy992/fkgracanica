import type { Metadata } from 'next';
import Link from 'next/link';
import { mediaUrl } from '../../../lib/media';
import { formatDate } from '../../../lib/utils';
import { getNewsBySlug } from '../../../lib/news';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return { title: 'Vijest nije pronađena — FK Gračanica' };
  return {
    title: item.seoTitle ?? item.title,
    description: item.seoDesc ?? item.excerpt ?? undefined,
    openGraph: {
      title: item.seoTitle ?? item.title,
      description: item.seoDesc ?? item.excerpt ?? undefined,
      images: item.coverPath ? [mediaUrl(item.coverPath, 'medium') ?? ''] : undefined,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getNewsBySlug(slug);

  if (!data) {
    return (
      <main className="min-h-screen bg-background text-text">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-sm text-text-muted">P-NEXT-02b · Next.js</p>
          <h1 className="font-display text-h1 font-bold">Vijest nije pronađena</h1>
          <p className="mt-4 text-text-muted">
            Tražena vijest <code className="bg-surface-deep px-2 py-1 rounded">{slug}</code> nije pronađena.
            <br />
            Backend nije dostupan u build-u — u runtime-u (revalidate 60s) povući će se sa
            <code className="ml-1 bg-surface-deep px-1 py-0.5 rounded">/api/v1/news/slug/:slug</code>.
          </p>
          <Link href="/vijesti" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white">
            ← Natrag na vijesti
          </Link>
        </div>
      </main>
    );
  }

  const cover = mediaUrl(data.coverPath, 'medium');
  const galleryPhotos = data.gallery?.photos ?? [];

  return (
    <article className="min-h-screen bg-background pb-16 text-text">
      <div className="relative overflow-hidden border-b border-border bg-surface-deep">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <Link href="/vijesti" className="mb-6 inline-flex text-xs text-text-muted hover:text-white">
            ← Sve vijesti
          </Link>
          {data.category?.name ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary-light">
              {data.category.name}
            </p>
          ) : null}
          <h1 className="font-display text-h1 font-bold leading-tight text-white md:text-display">
            {data.title}
          </h1>
          {data.publishedAt ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-white/60">
              <span>🕒</span> {formatDate(data.publishedAt)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        {data.videoUrl ? (
          <div className="mb-10 overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="aspect-video">
              <iframe
                src={data.videoUrl}
                title={data.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}

        <div className="glass-premium rounded-2xl border border-border bg-surface p-6 sm:p-8 md:p-10">
          <div
            className="prose max-w-none prose-invert text-base leading-relaxed sm:text-lg"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </div>

        {galleryPhotos.length > 0 ? (
          <div className="mt-10">
            <h2 className="font-display mb-4 text-h2 font-bold">Galerija</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {galleryPhotos.map((p) => {
                const url = mediaUrl(p.path, 'medium');
                return (
                  <div key={p.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={p.caption ?? ''} className="h-48 w-full object-cover" />
                    ) : null}
                    {p.caption ? <p className="p-3 text-xs text-text-muted">{p.caption}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {data.relatedPlayers?.length ? (
          <div className="mt-10 rounded-xl border border-border bg-surface p-6">
            <h3 className="font-display mb-3 text-sm font-bold uppercase tracking-wider">Povezani igrači</h3>
            <div className="flex flex-wrap gap-2">
              {data.relatedPlayers.map(({ player }) => (
                <Link
                  key={player.id}
                  href={`/igrac/${player.id}`}
                  className="rounded-full border border-border bg-surface-deep px-3 py-1.5 text-sm hover:border-primary/40"
                >
                  {player.firstName} {player.lastName}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10 rounded-xl border border-border bg-surface-deep p-6 text-center">
          <p className="text-xs font-mono text-text-muted">
            P-NEXT-02b · Next.js 15.5.29 · ISR 60s · <code>/api/v1/news/slug/{data.slug}</code>
          </p>
          <Link href="/vijesti" className="mt-3 inline-block text-sm text-primary-light">
            ← Natrag na sve vijesti
          </Link>
        </div>
      </div>
    </article>
  );
}
