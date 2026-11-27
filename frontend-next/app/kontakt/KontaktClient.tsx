'use client';

import { useState } from 'react';
import { getApiUrl } from '../../lib/media';

export default function KontaktClient() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Slanje nije uspjelo');
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Greška');
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    return (
      <div className="glass-premium rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-display text-h2 font-bold">Hvala!</p>
        <p className="mt-2 text-text-muted">Poruka je poslana. Odgovorit ćemo uskoro.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="font-display font-bold">FK Gračanica</h3>
        <p className="mt-2 text-sm text-text-muted">Stadion Luke, Gračanica</p>
        <p className="text-sm text-text-muted">kontakt@fkgracanica.ba</p>
        <p className="mt-4 text-xs text-text-muted">Vite na /kontakt ostaje dostupan.</p>
      </div>
      <form onSubmit={onSubmit} className="glass-premium space-y-4 rounded-2xl border border-border bg-surface p-6">
        <input
          placeholder="Ime"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-border bg-surface-deep px-4 py-3 text-sm"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-border bg-surface-deep px-4 py-3 text-sm"
          required
        />
        <textarea
          placeholder="Poruka"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="min-h-[120px] w-full rounded-lg border border-border bg-surface-deep px-4 py-3 text-sm"
          required
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? 'Šaljem...' : 'Pošalji poruku'}
        </button>
      </form>
    </div>
  );
}
