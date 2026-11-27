export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-border bg-surface p-10 shadow-lg">
          <h1 className="font-display text-h1 font-bold text-text">
            FK Gračanica — Next.js Turbo Preview
          </h1>
          <p className="mt-4 text-body text-text-muted">
            Ovo je <span className="text-primary-light font-semibold">P-NEXT-01</span> — Next.js 15 + Turbopack koegzistira sa
            postojećim Vite buildom. Javni sajt i mobilna aplikacija ostaju nepromijenjeni (Vite je i dalje production).
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-deep p-4 border border-border">
              <div className="text-sm text-text-muted">Status</div>
              <div className="text-success font-semibold">Koegzistencija OK</div>
            </div>
            <div className="rounded-xl bg-surface-deep p-4 border border-border">
              <div className="text-sm text-text-muted">Build</div>
              <div className="font-semibold">Turbopack</div>
            </div>
            <div className="rounded-xl bg-surface-deep p-4 border border-border">
              <div className="text-sm text-text-muted">Tokeni</div>
              <div className="font-semibold">327/327 isti</div>
            </div>
          </div>
          <p className="mt-8 text-sm text-text-muted">
            Preview: <code className="bg-surface-deep px-2 py-1 rounded">frontend-next</code> na <code>next-preview</code> — Vite ostaje na <code>www</code>.
            Sljedeći korak P-NEXT-02a: selidba <code>/</code> (home) rutu po rutu.
          </p>
        </div>
      </div>
    </main>
  );
}
