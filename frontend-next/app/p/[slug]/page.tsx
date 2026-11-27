import type { Metadata } from 'next';
import { getApiUrl } from '../../../lib/media';

export const revalidate = 60;
export const dynamicParams = true;

type CmsPage = { id: string; slug: string; title: string; seoDesc?: string | null; sections?: { id: string; widgetType: string; sortOrder: number; config: Record<string, unknown>; enabled: boolean }[] };

async function getPage(slug: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(`${getApiUrl()}/cms/pages/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    if (res.ok) return (await res.json()) as CmsPage;
  } catch {}
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPage(slug);
  if (!p) return { title: 'Stranica — FK Gračanica' };
  return { title: p.title, description: p.seoDesc ?? undefined };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return (
      <main className="min-h-screen bg-background p-12 text-center text-text">
        <p className="text-sm text-text-muted">P-NEXT-02e</p>
        <h1 className="font-display text-h1 font-bold">Stranica nije pronađena</h1>
        <p className="mt-4 text-text-muted">
          <code className="bg-surface-deep px-2 py-1 rounded">{slug}</code> — fallback (GET /api/v1/cms/pages/:slug).
        </p>
      </main>
    );
  }

  const sections = (page.sections ?? []).filter((s) => s.enabled).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02e · ISR 60s</p>
          <h1 className="font-display text-display font-bold">{page.title}</h1>
          {page.seoDesc ? <p className="mt-2 text-text-muted">{page.seoDesc}</p> : null}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {sections.length ? (
          <div className="grid gap-6">
            {sections.map((s, i) => (
              <div key={s.id} className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-xs font-mono text-text-muted">
                  #{i + 1} · {s.widgetType}
                </p>
                <p className="mt-2 font-semibold">{String((s.config as Record<string, unknown>).title ?? s.widgetType)}</p>
                <details className="mt-3 rounded-lg bg-surface-deep p-3">
                  <summary className="cursor-pointer text-xs text-text-muted">config</summary>
                  <pre className="mt-2 overflow-auto text-xs text-text-muted">{JSON.stringify(s.config, null, 2)}</pre>
                </details>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-text-muted">Nema sekcija.</p>
        )}
        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02e · <code>/api/v1/cms/pages/{page.slug}</code> · {sections.length} sekcija
        </p>
      </div>
    </main>
  );
}
