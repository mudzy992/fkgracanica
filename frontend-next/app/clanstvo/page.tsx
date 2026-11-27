import type { Metadata } from 'next';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Članstvo',
  description: 'Učlani se u FK Gračanica',
};

export default function ClanstvoPage() {
  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02e · ISR 60s</p>
          <h1 className="font-display text-display font-bold">Članstvo</h1>
          <p className="mt-2 text-text-muted">Postani dio kluba — podrži FK Gračanica.</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="glass-premium rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="font-display text-h2 font-bold">Učlani se</h2>
          <p className="mt-3 text-text-muted">
            Članstvo u FK Gračanica donosi brojne pogodnosti — popuste na ulaznice, pravo glasa na skupštini, i ponos pripadnosti.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-deep p-4 text-center">
              <p className="text-2xl font-bold text-primary-light">50 KM</p>
              <p className="text-xs uppercase tracking-wider text-text-muted">Godišnje</p>
            </div>
            <div className="rounded-xl bg-surface-deep p-4 text-center">
              <p className="text-2xl font-bold text-primary-light">20%</p>
              <p className="text-xs uppercase tracking-wider text-text-muted">Popust</p>
            </div>
            <div className="rounded-xl bg-surface-deep p-4 text-center">
              <p className="text-2xl font-bold text-primary-light">∞</p>
              <p className="text-xs uppercase tracking-wider text-text-muted">Ponos</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-text-muted">
            Prijava i plaćanje članstva dostupni su u mobilnoj aplikaciji i na šalteru stadiona.
            Vite na <code>/clanstvo</code> ostaje aktivan, Next je na <code>next-preview/clanstvo</code>.
          </p>
          <a href="/aplikacija" className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white">
            Preuzmi aplikaciju
          </a>
        </div>
        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02e · <code>feature.membership</code> · Vite parity
        </p>
      </div>
    </main>
  );
}
