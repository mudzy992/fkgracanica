import type { Metadata } from 'next';
import { getApiUrl, mediaUrl } from '../../lib/media';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Prvi tim',
  description: 'Sastav prvog tima FK Gračanica',
};

type SquadSlot = { player?: { id: string; firstName: string; lastName: string; number?: number | null; photoPath?: string | null } | null; isBench?: boolean };

async function getOwnClub(): Promise<{ id: string; name: string; stadium?: string | null } | null> {
  try {
    const res = await fetch(`${getApiUrl()}/clubs/own`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as { id: string; name: string };
  } catch { return null; }
}

async function getSquad(clubId: string): Promise<{ slots: SquadSlot[] } | null> {
  if (!clubId) return null;
  try {
    const res = await fetch(`${getApiUrl()}/clubs/${clubId}/squad`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as { slots: SquadSlot[] };
  } catch { return null; }
}

export default async function TimPage() {
  const club = await getOwnClub();
  const squad = club?.id ? await getSquad(club.id) : null;
  const players = squad?.slots.filter((s) => s.player).map((s) => s.player!) ?? [];

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02d · ISR 60s</p>
          <h1 className="font-display text-display font-bold">Prvi tim</h1>
          <p className="mt-2 text-text-muted">{club?.name ?? 'FK Gračanica'} — sastav prvog tima.</p>
          <p className="mt-1 text-xs font-mono text-text-muted">{players.length} igrača</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {!players.length ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-muted">
            Nema sastava — fallback (GET /api/v1/clubs/own + /clubs/:id/squad).
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((p) => {
              const photo = p.photoPath ? mediaUrl(p.photoPath, 'medium') : undefined;
              return (
                <div key={p.id} className="glass-premium rounded-2xl border border-border bg-surface p-5 text-center">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" className="mx-auto h-20 w-20 rounded-full object-cover" />
                  ) : (
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-primary-light">
                      {p.firstName[0]}
                      {p.lastName[0]}
                    </div>
                  )}
                  <p className="mt-3 font-semibold text-white">
                    {p.firstName} {p.lastName}
                  </p>
                  {p.number ? <p className="text-sm text-text-muted">#{p.number}</p> : null}
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02d · <code>/api/v1/clubs/own</code> · <code>/clubs/:id/squad</code>
        </p>
      </div>
    </main>
  );
}
