import type { Metadata } from 'next';
import Link from 'next/link';
import { AddToCart } from './ShopClient';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Shop',
  description: 'FK Shop — dresovi, šalovi, suveniri (P-PREMIUM-05 Cart)',
};

const PRODUCTS = [
  { id: 'dres-domaci', name: 'Dres domaći 24/25', price: '79 KM', priceKm: 79, tag: 'Hit' },
  { id: 'dres-gostujuci', name: 'Dres gostujući', price: '79 KM', priceKm: 79, tag: 'Novo' },
  { id: 'sal', name: 'Šal FK Gračanica', price: '25 KM', priceKm: 25, tag: 'Top' },
  { id: 'kapa', name: 'Kapa crno-crvena', price: '22 KM', priceKm: 22, tag: '' },
  { id: 'salica', name: 'Šalica 330ml', price: '15 KM', priceKm: 15, tag: '' },
  { id: 'privjesak', name: 'Privjesak grb', price: '8 KM', priceKm: 8, tag: '' },
] as const;

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-[var(--border-subtle)] bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link href="/premium" className="text-xs text-text-muted hover:text-white">
            ← Premium
          </Link>
          <p className="mt-3 text-xs font-mono text-text-muted">P-PREMIUM-05 · ISR 60s · shop + Cart</p>
          <h1 className="font-display text-display font-bold">FK Shop</h1>
          <p className="mt-2 max-w-2xl text-text-muted">Dresovi, šalovi i suveniri. Dodaj u korpu i plati karticom (Stripe/Monri/PayPal).</p>
          <div className="mt-4 flex gap-3">
            <Link href="/premium/shop/cart" className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white">
              Korpa
            </Link>
            <Link href="/premium/shop/checkout" className="inline-flex h-11 items-center rounded-xl bg-surface-deep px-6 text-sm font-semibold">
              Checkout
            </Link>
          </div>
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
              <AddToCart id={p.id} name={p.name} priceKm={p.priceKm} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
