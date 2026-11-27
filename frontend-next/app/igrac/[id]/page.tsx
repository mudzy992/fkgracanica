import type { Metadata } from 'next';
import Link from 'next/link';
import { getApiUrl, mediaUrl } from '../../../lib/media';

export const revalidate = 60;
export const dynamicParams = true;

type Player = { id: string; firstName: string; lastName: string; number?: number | null; position?: string | null; photoPath?: string | null; bio?: string | null };

async function getPlayer(id: string): Promise<Player | null> {
  for (const url of [
    `${getApiUrl()}/players/${encodeURIComponent(id)}`,
    `${getApiUrl()}/clubs/players/${encodeURIComponent(id)}`,
  ]) {
    try {
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) return (await res.json()) as Player;
    } catch {}
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getPlayer(id);
  if (!p) return { title: 'Igrač — FK Gračanica' };
  return { title: `${p.firstName} ${p.lastName} — FK Gračanica`, description: p.bio ?? undefined };
}

export default async function IgracPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPlayer(id);

  if (!data) {
    return (
      <main className="min-h-screen bg-background p-12 text-center text-text">
        <p className="text-sm text-text-muted">P-NEXT-02d</p>
        <h1 className="font-display text-h1 font-bold">Igrač nije pronađen</h1>
        <p className="mt-4 text-text-muted">
          <code className="bg-surface-deep px-2 py-1 rounded">{id}</code> — fallback.
        </p>
        <Link href="/tim" className="mt-6 inline-block text-primary-light">
          ← Nazad na tim
        </Link>
      </main>
    );
  }

  const photo = data.photoPath ? mediaUrl(data.photoPath, 'medium') : undefined;

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="relative overflow-hidden border-b border-border bg-surface-deep">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Link href="/tim" className="mb-4 inline-block text-xs text-white/60">
            ← Tim
          </Link>
          <div className="flex gap-6">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="h-32 w-32 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-primary/20 text-2xl text-primary-light">
                {data.firstName[0]}
                {data.lastName[0]}
              </div>
            )}
            <div>
              <h1 className="font-display text-display font-bold text-white">
                {data.firstName} {data.lastName}
              </h1>
              {data.number ? <p className="text-white/60">#{data.number} · {data.position ?? '—'}</p> : null}
              {data.bio ? <p className="mt-4 text-white/80">{data.bio}</p> : null}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-10 text-center text-xs font-mono text-text-muted">
        P-NEXT-02d · <code>/api/v1/players/{data.id}</code>
      </p>
    </main>
  );
}
