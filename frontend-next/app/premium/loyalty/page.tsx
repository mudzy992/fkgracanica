import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Loyalty',
  description: 'Moj FK bodovi — loyalty program (P-PREMIUM-02)',
};

const TIERS = [
  { name: 'Bronza', min: 0, color: 'bg-amber-700', perks: '5% popusta' },
  { name: 'Srebro', min: 500, color: 'bg-slate-400', perks: '10% + prioritet karata' },
  { name: 'Zlato', min: 1500, color: 'bg-amber-400', perks: '15% + VIP loža' },
] as const;

export default function LoyaltyPage() {
  const points = 870;
  const tier = points >= 1500 ? TIERS[2] : points >= 500 ? TIERS[1] : TIERS[0];
  const next = points >= 1500 ? null : points >= 500 ? TIERS[2] : TIERS[1];
  const progress = next ? Math.min(100, Math.round(((points - tier.min) / (next.min - tier.min)) * 100)) : 100;

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-[var(--border-subtle)] bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link href="/premium" className="text-xs text-text-muted hover:text-white">
            ← Premium
          </Link>
          <p className="mt-3 text-xs font-mono text-text-muted">P-PREMIUM-02 · ISR 60s · loyalty</p>
          <h1 className="font-display text-display font-bold">Moj FK bodovi</h1>
          <p className="mt-2 max-w-2xl text-text-muted">Skupljaj bodove za svaku posjetu, kupovinu i dijeljenje. Tier se računa automatski.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-6 shadow-[var(--shadow-premium)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary-light">Trenutni tier</p>
              <p className="mt-1 font-display text-2xl font-bold">{tier.name} · {points} bodova</p>
              <p className="text-sm text-text-muted">{tier.perks}</p>
            </div>
            <span className={`inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold text-white ${tier.color}`}>{tier.name}</span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-surface-deep">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} aria-hidden />
          </div>
          <p className="mt-2 text-xs text-text-muted">
            {next ? `${points} / ${next.min} do ${next.name} — ${progress}%` : 'Maksimum — Zlato!'}
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-6">
              <span className={`inline-flex h-2 w-8 rounded-full ${t.color}`} aria-hidden />
              <h3 className="mt-3 font-display font-bold">{t.name}</h3>
              <p className="text-sm text-text-muted">Od {t.min} bodova · {t.perks}</p>
              <p className="mt-2 text-xs font-mono text-text-muted">{t.min}–{t.name === 'Zlato' ? '∞' : TIERS[TIERS.indexOf(t) + 1].min - 1}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Link href="/premium/shop" className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white">
            U shop
          </Link>
          <Link href="/premium" className="inline-flex h-11 items-center rounded-xl bg-surface-deep px-6 text-sm font-semibold">
            Nazad
          </Link>
        </div>
      </div>
    </main>
  );
}
