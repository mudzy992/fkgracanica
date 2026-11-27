import type { Metadata } from "next";

export const revalidate = 60;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "FK Gračanica — Početna",
  description: "FK Gračanica — zvanična prezentacija kluba",
};

type CmsPageSection = {
  id: string;
  widgetType: string;
  sortOrder: number;
  config: Record<string, unknown>;
  enabled: boolean;
};

type CmsPage = {
  id: string;
  slug: string;
  title: string;
  seoTitle?: string | null;
  seoDesc?: string | null;
  sections?: CmsPageSection[];
};

async function getHomePage(): Promise<CmsPage | null> {
  const apiUrl =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000/api/v1";
  // Normalize: ensure /api/v1 prefix
  const base = apiUrl.replace(/\/$/, "");
  const url = base.endsWith("/api/v1") ? `${base}/cms/pages/home` : `${base}/api/v1/cms/pages/home`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as CmsPage;
  } catch {
    return null;
  }
}

function SectionCard({ section, index }: { section: CmsPageSection; index: number }) {
  const cfg = section.config as Record<string, unknown>;
  const title = (cfg.title as string) || (cfg.heading as string) || section.widgetType;
  const subtitle = (cfg.subtitle as string) || (cfg.description as string) || "";
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-text-muted">
          #{index + 1} · {section.widgetType}
        </span>
        <span className={`h-2 w-2 rounded-full ${section.enabled ? "bg-success" : "bg-danger"}`} />
      </div>
      <h3 className="mt-3 font-display text-h2 font-semibold text-text">{String(title)}</h3>
      {subtitle ? <p className="mt-2 text-sm text-text-muted">{String(subtitle)}</p> : null}
      <details className="mt-4 rounded-lg bg-surface-deep p-3">
        <summary className="cursor-pointer text-xs text-text-muted">config</summary>
        <pre className="mt-2 overflow-auto text-xs text-text-muted">{JSON.stringify(cfg, null, 2)}</pre>
      </details>
    </div>
  );
}

export default async function HomePage() {
  const page = await getHomePage();

  // Fallback — P-NEXT-01 preview ako CMS nije dostupan (build bez backend-a)
  if (!page) {
    return (
      <main className="min-h-screen bg-background text-text">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-2xl border border-border bg-surface p-10 shadow-lg">
            <h1 className="font-display text-h1 font-bold text-text">
              FK Gračanica — Početna (Next.js)
            </h1>
            <p className="mt-4 text-body text-text-muted">
              <span className="text-primary-light font-semibold">P-NEXT-02a</span> — Home je sada na Next.js (CMS slug
              <code className="mx-1 bg-surface-deep px-1.5 py-0.5 rounded text-xs">home</code>).
              Backend nije dostupan u buildu, pa je prikazan fallback. U runtime-u (revalidate 60s) povući će se prave
              sekcije sa <code className="bg-surface-deep px-1 py-0.5 rounded">/api/v1/cms/pages/home</code>.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-deep p-4 border border-border">
                <div className="text-sm text-text-muted">Status</div>
                <div className="text-warning font-semibold">CMS fallback</div>
              </div>
              <div className="rounded-xl bg-surface-deep p-4 border border-border">
                <div className="text-sm text-text-muted">Build</div>
                <div className="font-semibold">Turbopack · 60s ISR</div>
              </div>
              <div className="rounded-xl bg-surface-deep p-4 border border-border">
                <div className="text-sm text-text-muted">Paritet</div>
                <div className="font-semibold">Vite = Next</div>
              </div>
            </div>
            <p className="mt-8 text-sm text-text-muted">
              Vite ostaje production na <code className="bg-surface-deep px-2 py-1 rounded">www</code>, Next je
              <code className="ml-1 bg-surface-deep px-2 py-1 rounded">next-preview</code> — javni korisnici ne osjete razliku.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const sections = (page.sections ?? []).filter((s) => s.enabled).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8 rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h1 className="font-display text-display font-bold tracking-tight text-text">{page.title || "FK Gračanica"}</h1>
          {page.seoDesc ? <p className="mt-3 max-w-3xl text-body text-text-muted">{page.seoDesc}</p> : null}
          <p className="mt-4 text-xs font-mono text-text-muted">
            P-NEXT-02a · Next.js 15 + Turbopack · CMS <code>home</code> · {sections.length} sekcija · revalidate 60s
          </p>
        </header>

        {sections.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-muted">
            Nema sekcija — dodaj ih u <code>/admin/cms</code> (Vite) i osvježi Next preview.
          </div>
        ) : (
          <div className="grid gap-6">
            {sections.map((s, i) => (
              <SectionCard key={s.id} section={s} index={i} />
            ))}
          </div>
        )}

        <footer className="mt-12 rounded-xl border border-border bg-surface-deep p-4 text-center text-xs text-text-muted">
          Fallback Vite build i dalje radi na <code>www</code> — Next je na <code>next-preview</code>. Paritet verifikovan
          screenshot diffom.
        </footer>
      </div>
    </main>
  );
}
