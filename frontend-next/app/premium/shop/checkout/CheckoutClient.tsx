'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';

const PROVIDERS = ['stripe', 'monri', 'paypal'] as const;

export default function CheckoutClient() {
  const { items, total, clear } = useCart();
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]>('stripe');
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    setUrl(null);
    try {
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: items.map((i) => i.id), provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? 'Greška');
      setUrl(data.checkoutUrl ?? data.url ?? null);
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 && !url) {
    return <p className="text-sm text-text-muted">Korpa je prazna — dodaj proizvode pa checkout.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-5">
        <p className="text-xs font-mono text-text-muted">Ukupno {total} KM · {items.length} stavki</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              className={`h-11 rounded-xl px-5 text-sm font-semibold capitalize ${provider === p ? 'bg-primary text-white' : 'bg-surface-deep'}`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || items.length === 0}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Obrada…' : `Plati — ${provider}`}
        </button>
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm text-primary-light underline">
            Otvori checkout: {url}
          </a>
        ) : null}
      </div>
      <p className="text-xs text-text-muted">Mock checkout — bez realne naplate. Provider: {provider}.</p>
    </div>
  );
}
