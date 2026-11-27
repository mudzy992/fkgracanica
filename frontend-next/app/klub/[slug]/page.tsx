import type { Metadata } from 'next';
import Link from 'next/link';
import { getApiUrl, mediaUrl } from '../../../lib/media';

export const revalidate = 60;
export const dynamicParams = true;

type Club = { id: string; name: string; slug: string; city?: string | null; stadium?: string | null; description?: string | null; logoPath?: string | null };

async function getClub(slug: string): Promise<Club | null> {
  for (const url of [
    `${getApiUrl()}/clubs/slug/${encodeURIComponent(slug)}`,
    `${getApiUrl()}/clubs/${encodeURIComponent(slug)}`,
  ]) {
    try {
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) return (await res.json()) as Club;
    } catch {}
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getClub(slug);
  if (!c) return { title: 'Klub — FK Gračanica' };
  return { title: `${c.name} — FK Gračanica`, description: c.description ?? undefined };
}

export default async function KlubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const club = await getClub(slug);

  if (!club) {
    return (
      <main className="min-h-screen bg-background p-12 text-center text-text">
        <p className="text-sm text-text-muted">P-NEXT-02d</p>
        <h1 className="font-display text-h1 font-bold">Klub nije pronađen</h1>
        <p className="mt-4 text-text-muted">
          <code className="bg-surface-deep px-2 py-1 rounded">{slug}</code> — fallback.
        </p>
        <Link href="/liga" className="mt-6 inline-block text-primary-light">
          ← Nazad na ligu
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="relative overflow-hidden border-b border-border bg-surface-deep">
        {club.logoPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(club.logoPath, 'medium') ?? ''} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Link href="/liga" className="mb-4 inline-block text-xs text-white/60">
            ← Liga
          </Link>
          <h1 className="font-display text-display font-bold text-white">{club.name}</h1>
          {club.city ? <p className="text-white/60">{club.city}</p> : null}
          {club.stadium ? <p className="text-sm text-white/60">🏟️ {club.stadium}</p> : null}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {club.description ? (
          <div className="glass-premium rounded-2xl border border-border bg-surface p-6 text-text-muted">
            <p>{club.description}</p>
          </div>
        ) : null}
        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02d · <code>/api/v1/clubs/slug/{club.slug}</code>
        </p>
      </div>
    </main>
  );
}
