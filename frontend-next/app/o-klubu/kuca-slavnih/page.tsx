import type { Metadata } from 'next';
import { getApiUrl, mediaUrl } from '../../../lib/media';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Kuća slavnih',
  description: 'Legende FK Gračanica',
};

type HofEntry = { id: string; name: string; years?: string | null; bio?: string | null; photoPath?: string | null; imagePath?: string | null };

async function getHof(): Promise<HofEntry[]> {
  try {
    const res = await fetch(`${getApiUrl()}/hall-of-fame`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const d = await res.json();
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object' && 'data' in d && Array.isArray((d as { data: unknown }).data)) return (d as { data: HofEntry[] }).data;
    return [];
  } catch { return []; }
}

export default async function KucaSlavnihPage() {
  const entries = await getHof();

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02e · ISR 60s · {entries.length} legendi</p>
          <h1 className="font-display text-display font-bold">Kuća slavnih</h1>
          <p className="mt-2 text-text-muted">Legende kluba.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {!entries.length ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-muted">
            Nema unosa — fallback (GET /api/v1/hall-of-fame).
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((e) => {
              const img = e.photoPath ?? e.imagePath;
              const url = img ? mediaUrl(img, 'medium') : undefined;
              return (
                <div key={e.id} className="glass-premium overflow-hidden rounded-2xl border border-border bg-surface">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={e.name} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-surface-deep text-2xl">{e.name[0]}</div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display font-bold text-white">{e.name}</h3>
                    {e.years ? <p className="text-xs text-text-muted">{e.years}</p> : null}
                    {e.bio ? <p className="mt-2 line-clamp-3 text-sm text-text-muted">{e.bio}</p> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02e · <code>/api/v1/hall-of-fame</code>
        </p>
      </div>
    </main>
  );
}
