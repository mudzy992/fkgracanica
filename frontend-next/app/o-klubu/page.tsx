import type { Metadata } from 'next';
import { getApiUrl } from '../../lib/media';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — O klubu',
  description: 'Historija i priča FK Gračanica',
};

type TimelineEvent = { id: string; year: number; title: string; description?: string | null; imagePath?: string | null };

async function getTimeline(): Promise<TimelineEvent[]> {
  try {
    const res = await fetch(`${getApiUrl()}/club-timeline`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const d = await res.json();
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object' && 'data' in d && Array.isArray((d as { data: unknown }).data)) return (d as { data: TimelineEvent[] }).data;
    return [];
  } catch { return []; }
}

export default async function OKlubuPage() {
  const chapters = await getTimeline();

  if (!chapters.length) {
    return (
      <main className="min-h-screen bg-background text-text">
        <div className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <p className="text-xs font-mono text-text-muted">P-NEXT-02d · ISR 60s</p>
            <h1 className="font-display text-display font-bold">O klubu</h1>
            <p className="mt-2 text-text-muted">Historija FK Gračanica.</p>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center text-text-muted">
          Nema podataka — fallback (GET /api/v1/club-timeline).
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02d · {chapters.length} poglavlja</p>
          <h1 className="font-display text-display font-bold tracking-tight">O klubu</h1>
          <p className="mt-2 text-text-muted">Hronologija i priča kluba.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
        {chapters
          .slice()
          .sort((a, b) => a.year - b.year)
          .map((c) => (
            <div key={c.id} className="glass-premium rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm font-bold text-primary-light">{c.year}</p>
              <h3 className="font-display text-h2 font-bold">{c.title}</h3>
              {c.description ? <p className="mt-3 text-text-muted">{c.description}</p> : null}
            </div>
          ))}
        <p className="text-center text-xs font-mono text-text-muted">
          P-NEXT-02d · <code>/api/v1/club-timeline</code>
        </p>
      </div>
    </main>
  );
}
