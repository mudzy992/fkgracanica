import type { Metadata } from 'next';
import { getApiUrl } from '../../lib/media';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FK Gračanica — Aplikacija',
  description: 'Preuzmi mobilnu aplikaciju FK Gračanica',
};

type LatestRelease = { version: string; apkSizeBytes: number; releaseNotes?: string | null };

async function getLatest(): Promise<LatestRelease | null> {
  try {
    const res = await fetch(`${getApiUrl()}/public/app-releases/android/latest`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as LatestRelease;
  } catch { return null; }
}

export default async function AplikacijaPage() {
  const latest = await getLatest();
  const downloadUrl = `${getApiUrl()}/public/app-releases/android/latest/download`;

  return (
    <main className="min-h-screen bg-background pb-16 text-text">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-mono text-text-muted">P-NEXT-02e · ISR 60s</p>
          <h1 className="font-display text-display font-bold">Aplikacija</h1>
          <p className="mt-2 text-text-muted">Mobilna aplikacija FK Gračanica za Android.</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {!latest ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-muted">
            Nema objave — fallback (GET /api/v1/public/app-releases/android/latest).
          </div>
        ) : (
          <div className="glass-premium rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <p className="font-display text-lg font-bold">Verzija {latest.version}</p>
            <p className="text-sm text-text-muted">
              Veličina: {Math.max(1, Math.round(latest.apkSizeBytes / (1024 * 1024)))} MB
            </p>
            {latest.releaseNotes ? <p className="mt-3 text-sm text-text-muted">{latest.releaseNotes}</p> : null}
            <a
              href={downloadUrl}
              className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white"
            >
              Preuzmi APK
            </a>
          </div>
        )}
        <p className="mt-10 text-center text-xs font-mono text-text-muted">
          P-NEXT-02e · <code>GET /api/v1/public/app-releases/android/latest</code>
        </p>
      </div>
    </main>
  );
}
