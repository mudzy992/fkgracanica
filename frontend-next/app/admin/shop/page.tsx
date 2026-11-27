'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/media';
import { getAuthHeader } from '@/lib/api';

type Product = { id: string; name: string; priceKm?: number; price?: unknown; tag?: string | null; isActive?: boolean };

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${getApiUrl()}/shop/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Greška');
  const j = await res.json();
  return Array.isArray(j) ? j : [];
}

async function createProduct(data: { name: string; price: number; tag?: string }) {
  const res = await fetch(`${getApiUrl()}/shop/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function AdminShopPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [tag, setTag] = useState('');

  const { data } = useQuery({
    queryKey: ['shop', 'admin', 'products'],
    queryFn: fetchProducts,
  });

  const create = useMutation({
    mutationFn: () => createProduct({ name, price: Number(price), tag: tag || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop'] });
      setName('');
      setPrice('');
      setTag('');
    },
  });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="font-display text-2xl font-bold">Shop — admin</h1>
      <p className="mt-1 text-xs font-mono text-text-muted">shop.manage · P-PREMIUM-05</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-5">
          <h2 className="font-semibold">Novi proizvod</h2>
          <div className="mt-3 space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv" className="h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-surface-deep px-3 text-sm" />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Cijena (KM)" type="number" className="h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-surface-deep px-3 text-sm" />
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag (Hit/Novo/Top)" className="h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-surface-deep px-3 text-sm" />
            <button type="button" onClick={() => create.mutate()} disabled={create.isPending} className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white disabled:opacity-50">
              {create.isPending ? 'Spremam…' : 'Kreiraj'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-5">
          <h2 className="font-semibold">Proizvodi ({data?.length ?? 0})</h2>
          <div className="mt-3 space-y-2">
            {(data ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-surface-deep px-3 py-2 text-sm">
                <span>{p.name} — {String(p.price ?? p.priceKm ?? '?')} KM {p.tag ? `· ${p.tag}` : ''}</span>
                <span className="text-xs font-mono text-text-muted">{p.id}</span>
              </div>
            ))}
            {!data?.length ? <p className="text-xs text-text-muted">Nema proizvoda — fallback mock ako DB prazan.</p> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
