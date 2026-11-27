'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';

export default function CartClient() {
  const { items, remove, clear, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-6 text-center">
        <p className="text-sm text-text-muted">Korpa je prazna.</p>
        <Link href="/premium/shop" className="mt-4 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white">
          Nazad u shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <div key={it.id} className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-surface p-4">
          <div>
            <p className="font-display font-bold">{it.name}</p>
            <p className="text-xs text-text-muted">
              {it.priceKm} KM × {it.qty}
            </p>
          </div>
          <button type="button" onClick={() => remove(it.id)} className="h-11 rounded-xl bg-surface-deep px-4 text-sm font-semibold">
            Ukloni
          </button>
        </div>
      ))}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface-deep p-6">
        <p className="text-sm text-text-muted">Ukupno</p>
        <p className="font-display text-2xl font-bold">{total} KM</p>
        <div className="mt-4 flex gap-3">
          <Link href="/premium/shop/checkout" className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white">
            Na checkout
          </Link>
          <button type="button" onClick={clear} className="inline-flex h-11 items-center rounded-xl bg-surface px-6 text-sm font-semibold">
            Isprazni
          </button>
        </div>
      </div>
    </div>
  );
}
