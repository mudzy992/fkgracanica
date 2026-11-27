import type { Metadata } from 'next';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Ulaznice',
  description: 'Kupovina ulaznica za utakmice FK Gračanica',
};

export default function UlaznicePage() {
  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02e · ISR 60s</p>
          <h1 className="font-display text-display font-bold">Ulaznice</h1>
          <p className="mt-2 text-text-muted">Rezerviši mjesto na stadionu.</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="glass-premium rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="font-display text-h2 font-bold">Prodaja ulaznica</h2>
          <p className="mt-3 text-text-muted">
            Ulaznice su dostupne online i na blagajni stadiona Luke. Podržani načini plaćanja: Stripe, PayPal, Monri.
          </p>
          <div className="mt-6 rounded-xl bg-surface-deep p-4">
            <p className="text-sm font-semibold">Stadion Luke</p>
            <p className="text-sm text-text-muted">Gračanica · Kapacitet 3.000</p>
            <p className="mt-2 text-xs text-text-muted">Radno vrijeme blagajne: 10:00–18:00, dan utakmice do 20:00</p>
          </div>
          <p className="mt-6 text-sm text-text-muted">
            Vite na <code>/ulaznice</code> ima punu rezervaciju i QR, Next je na <code>next-preview/ulaznice</code> — parity u P-DASH-05 (Redar).
          </p>
        </div>
        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02e · <code>modules.ticketing</code> · Vite parity
        </p>
      </div>
    </main>
  );
}
