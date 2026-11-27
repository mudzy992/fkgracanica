import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Shop',
  description: 'FK Shop — dresovi, šalovi, suveniri (P-PREMIUM-02)',
};

const PRODUCTS = [
  { id: 'dres-domaci', name: 'Dres domaći 24/25', price: '79 KM', tag: 'Hit' },
  { id: 'dres-gostujuci', name: 'Dres gostujući', price: '79 KM', tag: 'Novo' },
  { id: 'sal', name: 'Šal FK Gračanica', price: '25 KM', tag: 'Top' },
  { id: 'kapa', name: 'Kapa crno-crvena', price: '22 KM', tag: '' },
  { id: 'salica', name: 'Šalica 330ml', price: '15 KM', tag: '' },
  { id: 'privjesak', name: 'Privjesak grb', price: '8 KM', tag: '' },
] as const;

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-[var(--border-subtle)] bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link href="/premium" className="text-xs text-text-muted hover:text-white">
            ← Premium
          </Link>
          <p className="mt-3 text-xs font-mono text-text-muted">P-PREMIUM-02 · ISR 60s · shop</p>
          <h1 className="font-display text-display font-bold">FK Shop</h1>
          <p className="mt-2 max-w-2xl text-text-muted">Dresovi, šalovi i suveniri. Online narudžba — plaćanje pouzećem ili karticom (uskoro).</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-5 shadow-[var(--shadow-premium)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-text-muted">{p.id}</span>
                {p.tag ? <span className="rounded-full bg-primary px-2 py-1 text-xs font-semibold text-white">{p.tag}</span> : null}
              </div>
              <div className="mt-3 h-28 rounded-xl bg-surface-deep" aria-hidden />
              <h3 className="mt-3 font-display font-bold">{p.name}</h3>
              <p className="text-sm font-semibold text-primary-light">{p.price}</p>
              <button type="button" className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-surface-deep text-sm font-semibold hover:bg-primary hover:text-white">
                Dodaj u korpu — uskoro
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--border-subtle)] bg-surface-deep p-6">
          <p className="text-xs font-mono text-text-muted">P-PREMIUM-02 · S-relaxed · shop 44px touch · 6 proizvoda</p>
          <p className="mt-2 text-sm text-text-muted">
            Korpa i checkout dolaze u <code>P-PREMIUM-03</code> (Stripe/Monri). Ovaj ekran je statički ISR — nema API mutacije.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/premium/loyalty" className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white">
              Loyalty
            </Link>
            <Link href="/premium" className="inline-flex h-11 items-center rounded-xl bg-surface px-6 text-sm font-semibold">
              Nazad
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
