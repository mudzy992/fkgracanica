import type { Metadata } from 'next';
import Link from 'next/link';
import CheckoutClient from './CheckoutClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'FK Gračanica — Checkout',
  description: 'Checkout — Stripe/Monri/PayPal (P-PREMIUM-05)',
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-[var(--border-subtle)] bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link href="/premium/shop/cart" className="text-xs text-text-muted hover:text-white">
            ← Korpa
          </Link>
          <p className="mt-3 text-xs font-mono text-text-muted">P-PREMIUM-05 · checkout</p>
          <h1 className="font-display text-display font-bold">Checkout</h1>
          <p className="mt-2 text-sm text-text-muted">Stripe · Monri · PayPal — mock URL, DB order ako si prijavljen.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <CheckoutClient />
      </div>
    </main>
  );
}
