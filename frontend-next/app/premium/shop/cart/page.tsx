import type { Metadata } from 'next';
import Link from 'next/link';
import CartClient from './CartClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'FK Gračanica — Korpa',
  description: 'Korpa — P-PREMIUM-05',
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-[var(--border-subtle)] bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link href="/premium/shop" className="text-xs text-text-muted hover:text-white">
            ← Shop
          </Link>
          <p className="mt-3 text-xs font-mono text-text-muted">P-PREMIUM-05 · cart</p>
          <h1 className="font-display text-display font-bold">Korpa</h1>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <CartClient />
      </div>
    </main>
  );
}
