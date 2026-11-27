import type { Metadata } from 'next';
import Link from 'next/link';
import { getApiUrl } from '../../../lib/media';
import { formatDate } from '../../../lib/utils';

export const revalidate = 60;
export const dynamicParams = true;

type Match = {
  id: string;
  homeClub?: { name: string };
  awayClub?: { name: string };
  homeScore: number;
  awayScore: number;
  status: string;
  scheduledAt: string;
  venue?: string | null;
};

async function getMatch(id: string): Promise<Match | null> {
  try {
    const res = await fetch(`${getApiUrl()}/matches/${encodeURIComponent(id)}`, { next: { revalidate: 60 } });
    if (res.ok) return (await res.json()) as Match;
  } catch {}
  try {
    const res = await fetch(`${getApiUrl()}/matches/slug/${encodeURIComponent(id)}`, { next: { revalidate: 60 } });
    if (res.ok) return (await res.json()) as Match;
  } catch {}
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = await getMatch(id);
  if (!m) return { title: 'Utakmica — FK Gračanica' };
  const title = `${m.homeClub?.name ?? 'Domaćin'} ${m.homeScore}:${m.awayScore} ${m.awayClub?.name ?? 'Gost'}`;
  return { title, description: `${m.status} · ${formatDate(m.scheduledAt)}` };
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getMatch(id);

  if (!data) {
    return (
      <main className="min-h-screen bg-background p-12 text-center text-text">
        <p className="text-sm text-text-muted">P-NEXT-02d</p>
        <h1 className="font-display text-h1 font-bold">Utakmica nije pronađena</h1>
        <p className="mt-4 text-text-muted">
          <code className="bg-surface-deep px-2 py-1 rounded">{id}</code> — fallback (GET /api/v1/matches/:id).
        </p>
        <Link href="/liga" className="mt-6 inline-block text-primary-light">
          ← Nazad na ligu
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02d · {data.status}</p>
          <div className="mt-4 flex items-center justify-center gap-4 font-display text-3xl font-bold">
            <span>{data.homeClub?.name ?? 'Domaćin'}</span>
            <span className="rounded-full bg-primary px-4 py-1 text-white">
              {data.homeScore} : {data.awayScore}
            </span>
            <span>{data.awayClub?.name ?? 'Gost'}</span>
          </div>
          <p className="mt-3 text-sm text-text-muted">
            {formatDate(data.scheduledAt)} {data.venue ? `· ${data.venue}` : ''}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6">
        <p className="rounded-xl border border-border bg-surface-deep p-6 text-sm text-text-muted">
          Match centar — live komentari, statistike i izvještaj dostupni kad je backend aktivan.
        </p>
        <p className="mt-6 text-xs font-mono text-text-muted">
          P-NEXT-02d · <code>/api/v1/matches/{data.id}</code>
        </p>
        <Link href="/liga" className="mt-4 inline-block text-sm text-primary-light">
          ← Tabela
        </Link>
      </div>
    </main>
  );
}
