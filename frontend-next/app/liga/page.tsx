import type { Metadata } from 'next';
import Link from 'next/link';
import { getApiUrl } from '../../lib/media';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Liga',
  description: 'Tabela i rezultati lige',
};

type StandingRow = { clubId: string; clubName: string; points: number; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number };
type Season = { id: string; name: string };

async function getSeasons(): Promise<Season[]> {
  try {
    const res = await fetch(`${getApiUrl()}/seasons`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const d = await res.json();
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object' && 'data' in d && Array.isArray((d as { data: unknown }).data)) return (d as { data: Season[] }).data;
    return [];
  } catch { return []; }
}

async function getStandings(seasonId: string): Promise<StandingRow[]> {
  if (!seasonId) return [];
  try {
    const res = await fetch(`${getApiUrl()}/standings?seasonId=${seasonId}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const d = await res.json();
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object' && 'data' in d && Array.isArray((d as { data: unknown }).data)) return (d as { data: StandingRow[] }).data;
    return [];
  } catch { return []; }
}

export default async function LigaPage() {
  const seasons = await getSeasons();
  const season = seasons[0];
  const standings = season ? await getStandings(season.id) : [];

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02d · ISR 60s · {seasons.length} sezona</p>
          <h1 className="font-display text-display font-bold tracking-tight">Liga</h1>
          <p className="mt-2 text-text-muted">{season ? season.name : 'Tabela i rezultati.'}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {!standings.length ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-muted">
            Nema tabele — fallback (GET /api/v1/standings?seasonId=).
            <br />
            <span className="text-xs">Pokreni backend za live podatke.</span>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-surface-deep text-xs uppercase text-text-muted">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Klub</th>
                  <th className="p-3 text-center">UT</th>
                  <th className="p-3 text-center">BOD</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((r, i) => (
                  <tr key={r.clubId} className="border-t border-border">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-semibold">{r.clubName}</td>
                    <td className="p-3 text-center">{r.played}</td>
                    <td className="p-3 text-center font-bold text-primary-light">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6 flex gap-4 text-xs">
          <Link href="/utakmice/test" className="text-primary-light">
            Primjer utakmice →
          </Link>
          <Link href="/tim" className="text-text-muted">
            Prvi tim →
          </Link>
        </div>
        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02d · <code>/api/v1/seasons</code> · <code>/standings</code>
        </p>
      </div>
    </main>
  );
}
