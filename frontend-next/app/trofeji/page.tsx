import type { Metadata } from 'next';
import { getApiUrl, mediaUrl } from '../../lib/media';
import { splitFeaturedTrophy } from '../../lib/trophy-utils';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Trofeji',
  description: 'Trofeji i uspjesi FK Gračanica',
};

type Trophy = {
  id: string;
  name: string;
  year: number;
  competition?: string | null;
  imagePath?: string | null;
  description?: string | null;
  featured?: boolean;
};

async function getTrophies(): Promise<Trophy[]> {
  try {
    const res = await fetch(`${getApiUrl()}/trophies`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data))
      return (data as { data: Trophy[] }).data;
    return [];
  } catch {
    return [];
  }
}

export default async function TrofejiPage() {
  const trophies = await getTrophies();
  const { featured, rest } = splitFeaturedTrophy(trophies);

  if (!trophies.length) {
    return (
      <main className="min-h-screen bg-background text-text">
        <div className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <p className="text-xs font-mono text-text-muted">P-NEXT-02c · ISR 60s</p>
            <h1 className="font-display text-display font-bold">Trofeji</h1>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center text-text-muted">
          Nema trofeja — fallback (GET /api/v1/trophies).
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="text-xs font-mono text-text-muted">
            P-NEXT-02c · ISR 60s · {trophies.length} trofeja
          </p>
          <h1 className="font-display text-display font-bold tracking-tight">Trofeji</h1>
          <p className="mt-2 text-text-muted">Ponos kluba kroz godine.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {featured ? (
          <div className="glass-premium mb-10 overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
              {featured.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(featured.imagePath, 'medium') ?? ''} alt="" className="h-64 w-full rounded-2xl object-contain bg-surface-deep p-4" />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl bg-primary/10 font-display text-5xl font-bold text-primary-light">
                  {featured.year}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary-light">
                  {featured.year} · {featured.competition ?? 'Trofej'}
                </p>
                <h2 className="font-display mt-2 text-h1 font-bold">{featured.name}</h2>
                {featured.description ? (
                  <p className="mt-4 text-text-muted">{featured.description}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {rest.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((t) => (
              <div key={t.id} className="glass-premium rounded-2xl border border-border bg-surface p-5">
                <div className="flex gap-4">
                  {t.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(t.imagePath, 'thumb') ?? ''} alt="" className="h-16 w-16 object-contain" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary-light">
                      {t.year}
                    </div>
                  )}
                  <div>
                    <p className="font-display font-bold text-primary-light">{t.year}</p>
                    <p className="font-semibold text-white">{t.name}</p>
                    {t.competition ? <p className="text-sm text-text-muted">{t.competition}</p> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02c · <code>/api/v1/trophies</code> · {trophies.length} trofeja
        </p>
      </div>
    </main>
  );
}
