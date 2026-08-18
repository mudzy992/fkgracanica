import { ArrowRight, Landmark, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mediaUrl } from '../../lib/media';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['club-about-cta'] };

export function ClubAboutCtaWidget({ config }: Props) {
  const storyImage = config.storyImage ? mediaUrl(config.storyImage, 'original') : null;
  const heritageImage = config.heritageImage ? mediaUrl(config.heritageImage, 'original') : null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f] p-6 shadow-[0_30px_90px_rgba(2,6,23,0.45)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_30%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100">
              <Sparkles className="h-3.5 w-3.5" />
              {config.eyebrow || 'Dokumentar kluba'}
            </div>
            <div>
              <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {config.title || 'Uđi u priču kluba i otkrij baštinu koja čuva njegova najveća imena.'}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {config.text ||
                  'Cinematic pregled historije vodi kroz ključne ere, a završna scena otvara vrata Kuće slavnih.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={config.primaryUrl || '/o-klubu'}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
              >
                {config.primaryLabel || 'Pregledaj O klubu'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Timeline iskustvo</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Scroll vodi kroz ere kluba, kadar po kadar, sve do završne baštinske scene.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                <div className="flex items-center gap-2 text-amber-100">
                  <Landmark className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.24em]">
                    {config.secondaryLabel || 'Kuća slavnih'}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-amber-50/85">
                  {config.secondaryText || 'Ekskluzivno otključavanje na kraju priče kluba.'}
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/60">
              {storyImage ? (
                <img src={storyImage} alt="" className="h-72 w-full object-cover sm:h-80" />
              ) : (
                <div className="flex h-72 items-center justify-center bg-[linear-gradient(160deg,#0f172a,#1d4ed8)] text-sm font-semibold uppercase tracking-[0.3em] text-white/70 sm:h-80">
                  O klubu
                </div>
              )}
            </div>
            <div className="overflow-hidden rounded-[1.75rem] border border-amber-300/20 bg-slate-950/70 sm:mt-10">
              {heritageImage ? (
                <img src={heritageImage} alt="" className="h-72 w-full object-cover sm:h-80" />
              ) : (
                <div className="flex h-72 items-center justify-center bg-[linear-gradient(180deg,#120d05,#3f2a0f)] text-sm font-semibold uppercase tracking-[0.3em] text-amber-100/75 sm:h-80">
                  Baština
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
