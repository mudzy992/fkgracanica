import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Checkout',
  description: 'Checkout — Stripe/Monri mock (P-PREMIUM-03)',
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-[var(--border-subtle)] bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link href="/premium/shop/cart" className="text-xs text-text-muted hover:text-white">
            ← Korpa
          </Link>
          <p className="mt-3 text-xs font-mono text-text-muted">P-PREMIUM-03 · ISR 60s · checkout</p>
          <h1 className="font-display text-display font-bold">Checkout</h1>
          <p className="mt-2 text-text-muted">Stripe / Monri / PayPal — mock integracija (P-PREMIUM-03 S).</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-6 shadow-[var(--shadow-premium)]">
          <h3 className="font-display font-bold">Sažetak</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between"><span>Dres domaći ×1</span><span>79 KM</span></li>
            <li className="flex justify-between"><span>Šal ×2</span><span>50 KM</span></li>
            <li className="flex justify-between border-t border-[var(--border-subtle)] pt-2 font-bold"><span>Ukupno</span><span className="text-primary-light">129 KM</span></li>
          </ul>
          <p className="mt-3 text-xs font-mono text-text-muted">POST /shop/checkout → {`{ checkoutUrl }`} → redirect</p>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-6">
          <h3 className="font-display font-bold">Plaćanje</h3>
          <div className="mt-4 grid gap-3">
            <button type="button" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white">
              Plati karticom (Stripe) — mock
            </button>
            <button type="button" className="inline-flex h-11 items-center justify-center rounded-xl bg-surface-deep text-sm font-semibold">
              Plati Monri — mock
            </button>
            <button type="button" className="inline-flex h-11 items-center justify-center rounded-xl bg-surface-deep text-sm font-semibold">
              PayPal — mock
            </button>
          </div>
          <p className="mt-4 text-xs text-text-muted">Realni provider pozivi (StripeProvider, MonriProvider, PaypalProvider) u P-PREMIUM-04. Loyalty: 129 KM → +1290 bodova.</p>
          <Link href="/premium/loyalty" className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-surface-deep px-6 text-sm font-semibold">
            Vidi loyalty
          </Link>
        </div>
      </div>
    </main>
  );
}
