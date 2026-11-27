import type { Metadata } from 'next';
import { getApiUrl, mediaUrl } from '../../lib/media';
import { groupSponsorsByTier, SPONSOR_TIER_META } from '../../lib/sponsor-tiers';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Sponzori',
  description: 'Sponzori i partneri FK Gračanica',
};

type Sponsor = {
  id: string;
  name: string;
  logoPath?: string | null;
  url?: string | null;
  tier: string;
};

async function getSponsors(): Promise<Sponsor[]> {
  try {
    const res = await fetch(`${getApiUrl()}/sponsors`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data))
      return (data as { data: Sponsor[] }).data;
    return [];
  } catch {
    return [];
  }
}

export default async function SponzoriPage() {
  const sponsors = await getSponsors();
  const groups = groupSponsorsByTier(sponsors);
  const total = sponsors.length;

  if (!groups.length) {
    return (
      <main className="min-h-screen bg-background text-text">
        <div className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <p className="text-xs font-mono text-text-muted">P-NEXT-02c · ISR 60s</p>
            <h1 className="font-display text-display font-bold">Sponzori</h1>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center text-text-muted">
          Nema sponzora — fallback (GET /api/v1/sponsors).
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02c · ISR 60s · {total} sponzora</p>
          <h1 className="font-display text-display font-bold tracking-tight">Sponzori</h1>
          <p className="mt-2 text-text-muted">Zahvaljujemo se svim sponzorima i partnerima.</p>
        </div>
      </div>

      <div className="space-y-10 pt-10 sm:space-y-14">
        {groups.map(({ tier, sponsors: tierSponsors }) => {
          const meta = SPONSOR_TIER_META[tier as keyof typeof SPONSOR_TIER_META];
          return (
            <section key={tier} className="mx-auto max-w-6xl px-4 sm:px-6">
              <h2 className="font-display text-h2 font-bold uppercase">{meta.label}</h2>
              <p className="mb-6 text-sm text-text-muted">{meta.subtitle}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tierSponsors.map((s) => {
                  const logo = s.logoPath ? mediaUrl(s.logoPath, 'medium') : undefined;
                  const content = (
                    <div className="glass-premium flex h-full flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-center">
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt={s.name} className="h-16 object-contain" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary-light">
                          {s.name[0]}
                        </div>
                      )}
                      <p className="font-semibold text-white">{s.name}</p>
                      <p className="text-xs uppercase tracking-wider text-text-muted">{s.tier}</p>
                    </div>
                  );
                  return s.url ? (
                    <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="block">
                      {content}
                    </a>
                  ) : (
                    <div key={s.id}>{content}</div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs font-mono text-text-muted">
        P-NEXT-02c · <code>/api/v1/sponsors</code> · {total} sponzora
      </p>
    </main>
  );
}
