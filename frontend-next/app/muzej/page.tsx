import type { Metadata } from 'next';
import { getApiUrl, mediaUrl } from '../../lib/media';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Muzej',
  description: 'Muzej i eksponati FK Gračanica',
};

type MuseumItem = { id: string; title: string; description?: string | null; year?: number | null; imagePath?: string | null; category?: string };

async function getMuseum(): Promise<MuseumItem[]> {
  try {
    const res = await fetch(`${getApiUrl()}/museum`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const d = await res.json();
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object' && 'data' in d && Array.isArray((d as { data: unknown }).data)) return (d as { data: MuseumItem[] }).data;
    return [];
  } catch { return []; }
}

export default async function MuzejPage() {
  const items = await getMuseum();

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02d · ISR 60s · {items.length} eksponata</p>
          <h1 className="font-display text-display font-bold">Muzej</h1>
          <p className="mt-2 text-text-muted">Historijski eksponati kluba.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {!items.length ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-muted">
            Nema eksponata — fallback (GET /api/v1/museum).
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => {
              const img = it.imagePath ? mediaUrl(it.imagePath, 'medium') : undefined;
              return (
                <div key={it.id} className="glass-premium overflow-hidden rounded-2xl border border-border bg-surface">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="h-48 w-full object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-surface-deep text-text-muted">{it.title}</div>
                  )}
                  <div className="p-5">
                    <p className="text-xs text-text-muted">
                      {it.year ?? '—'} {it.category ? `· ${it.category}` : ''}
                    </p>
                    <h3 className="font-display mt-1 font-bold text-white">{it.title}</h3>
                    {it.description ? <p className="mt-2 line-clamp-3 text-sm text-text-muted">{it.description}</p> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02d · <code>/api/v1/museum</code>
        </p>
      </div>
    </main>
  );
}
