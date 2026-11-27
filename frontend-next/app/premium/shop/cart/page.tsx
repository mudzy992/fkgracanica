import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Korpa',
  description: 'Korpa — FK Shop (P-PREMIUM-03)',
};

const CART = [
  { id: 'dres-domaci', name: 'Dres domaći 24/25', price: 79, qty: 1 },
  { id: 'sal', name: 'Šal FK Gračanica', price: 25, qty: 2 },
] as const;

export default function CartPage() {
  const total = CART.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-[var(--border-subtle)] bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link href="/premium/shop" className="text-xs text-text-muted hover:text-white">
            ← Shop
          </Link>
          <p className="mt-3 text-xs font-mono text-text-muted">P-PREMIUM-03 · ISR 60s · cart</p>
          <h1 className="font-display text-display font-bold">Korpa</h1>
          <p className="mt-2 text-text-muted">Pregled narudžbe — mock korpa, bez perzistencije (P-PREMIUM-03 S).</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-6 shadow-[var(--shadow-premium)]">
          <ul className="divide-y divide-[var(--border-subtle)]">
            {CART.map((i) => (
              <li key={i.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold">{i.name}</p>
                  <p className="text-xs font-mono text-text-muted">{i.id} · ×{i.qty}</p>
                </div>
                <span className="font-mono text-sm">{i.price * i.qty} KM</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
            <span className="font-display font-bold">Ukupno</span>
            <span className="font-mono font-bold text-primary-light">{total} KM</span>
          </div>
          <Link href="/premium/shop/checkout" className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white">
            Na checkout →
          </Link>
          <Link href="/premium/shop" className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-surface-deep text-sm font-semibold">
            Nastavi kupovinu
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-surface-deep p-6">
          <p className="text-xs font-mono text-text-muted">GET /shop/cart?ids=dres-domaci,sal · POST /shop/checkout (mock Stripe/Monri)</p>
          <p className="mt-2 text-sm text-text-muted">Korpa je statički ISR mock — realna korpa (localStorage + API) u P-PREMIUM-04.</p>
        </div>
      </div>
    </main>
  );
}
