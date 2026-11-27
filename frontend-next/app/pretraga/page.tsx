import type { Metadata } from 'next';
import Link from 'next/link';
import { getApiUrl } from '../../lib/media';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Pretraga',
  description: 'Pretraži vijesti, igrače i utakmice',
};

type SearchResults = { news: { id: string; slug: string; title: string }[]; players: { id: string; firstName: string; lastName: string }[]; matches: { id: string }[] };

async function search(q: string): Promise<SearchResults | null> {
  if (!q || q.length < 2) return null;
  try {
    const res = await fetch(`${getApiUrl()}/search?q=${encodeURIComponent(q)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as SearchResults;
  } catch { return null; }
}

export default async function PretragaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const data = query ? await search(query) : null;

  const hasResults = data && (data.news.length > 0 || data.players.length > 0 || data.matches.length > 0);

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02d · ISR 60s</p>
          <h1 className="font-display text-display font-bold">Pretraga</h1>
          <p className="mt-2 text-text-muted">Pretraži vijesti, igrače i utakmice.</p>
          <form action="/pretraga" method="GET" className="mt-6 flex gap-2">
            <input
              name="q"
              defaultValue={query}
              placeholder="Unesi pojam..."
              className="flex-1 rounded-lg border border-border bg-surface-deep px-4 py-3 text-sm"
            />
            <button type="submit" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white">
              Traži
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {!query ? (
          <p className="py-12 text-center text-text-muted">Unesi pojam za pretragu (min 2 znaka).</p>
        ) : !query || query.length < 2 ? (
          <p className="py-12 text-center text-text-muted">Unesi barem 2 znaka.</p>
        ) : !data ? (
          <p className="py-12 text-center text-text-muted">Pretraga nije dostupna — fallback (GET /api/v1/search?q=).</p>
        ) : !hasResults ? (
          <p className="py-12 text-center text-text-muted">Nema rezultata za &quot;{query}&quot;.</p>
        ) : (
          <div className="space-y-8">
            {data.news.length ? (
              <section>
                <h3 className="font-display mb-3 font-bold">Vijesti ({data.news.length})</h3>
                <div className="space-y-2">
                  {data.news.map((n) => (
                    <Link key={n.id} href={`/vijesti/${n.slug}`} className="block rounded-xl border border-border bg-surface p-4 hover:border-primary/30">
                      {n.title}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
            {data.players.length ? (
              <section>
                <h3 className="font-display mb-3 font-bold">Igrači ({data.players.length})</h3>
                <div className="space-y-2">
                  {data.players.map((p) => (
                    <Link key={p.id} href={`/igrac/${p.id}`} className="block rounded-xl border border-border bg-surface p-4 hover:border-primary/30">
                      {p.firstName} {p.lastName}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02d · <code>/api/v1/search?q={query ?? '...'}</code>
        </p>
      </div>
    </main>
  );
}
