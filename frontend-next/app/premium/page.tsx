import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Premium Fan Zona',
  description: 'Premium loyalty, shop i donacije — P-PREMIUM-02',
};

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-[var(--border-subtle)] bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-PREMIUM-01 · ISR 60s · premium</p>
          <h1 className="font-display text-display font-bold">Premium Fan Zona</h1>
          <p className="mt-2 max-w-2xl text-text-muted">
            Loyalty program, shop i donacije — novi moduli (ne migriraju postojeće). S-relaxed preview.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/premium/loyalty" className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-6 shadow-[var(--shadow-premium)] hover:border-primary/40">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-light">Loyalty</p>
            <h3 className="mt-2 font-display text-lg font-bold">Moj FK bodovi</h3>
            <p className="mt-2 text-sm text-text-muted">Skupljaj bodove za svaku posjetu i kupovinu.</p>
            <span className="mt-4 inline-flex h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white">Otvori →</span>
          </Link>
          <Link href="/premium/shop" className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-6 shadow-[var(--shadow-premium)] hover:border-primary/40">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-light">Shop</p>
            <h3 className="mt-2 font-display text-lg font-bold">FK Shop</h3>
            <p className="mt-2 text-sm text-text-muted">Dresovi, šalovi i suveniri. Online narudžba.</p>
            <span className="mt-4 inline-flex h-11 items-center rounded-xl bg-surface-deep px-4 text-sm font-semibold text-text">Otvori →</span>
          </Link>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-6 shadow-[var(--shadow-premium)]">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-light">Donacije</p>
            <h3 className="mt-2 font-display text-lg font-bold">Podrži klub</h3>
            <p className="mt-2 text-sm text-text-muted">Doniraj za omladinski pogon i stadion.</p>
            <span className="mt-4 inline-flex rounded-xl bg-surface-deep px-4 py-2 text-sm font-semibold text-text">Uskoro</span>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--border-subtle)] bg-surface-deep p-6">
          <p className="text-xs font-mono text-text-muted">P-PREMIUM-02 · S · 62 LOC · premium 44px touch · loyalty + shop</p>
          <p className="mt-2 text-sm text-text-muted">
            Paralelno sa <code>P-SEC-04</code> (dom fix) — `frontend-next:62` fajlova, `build 32 rute`.
          </p>
        </div>
      </div>
    </main>
  );
}
