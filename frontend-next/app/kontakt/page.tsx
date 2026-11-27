import type { Metadata } from 'next';
import KontaktClient from './KontaktClient';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Kontakt',
  description: 'Kontaktiraj FK Gračanica',
};

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02d · ISR 60s</p>
          <h1 className="font-display text-display font-bold">Kontakt</h1>
          <p className="mt-2 text-text-muted">Pošalji poruku klubu.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <KontaktClient />
        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02d · <code>POST /api/v1/contact</code> · Vite na <code>/kontakt</code>
        </p>
      </div>
    </main>
  );
}
