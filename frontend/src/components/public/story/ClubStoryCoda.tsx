import { Link } from 'react-router-dom';
import { ArrowRight, Landmark } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { mediaUrl } from '../../../lib/media';
import { defaultTransition, fadeUp } from '../../../lib/motion/presets';

interface Props {
  storyImages: string[];
  heritageImage?: string | null;
}

export function ClubStoryCoda({ storyImages, heritageImage }: Props) {
  const reduce = useReducedMotion();
  const leadImage = storyImages[0] ? mediaUrl(storyImages[0], 'original') : null;
  const supportImage = storyImages[1] ? mediaUrl(storyImages[1], 'original') : null;
  const hallImage = heritageImage ? mediaUrl(heritageImage, 'original') : null;

  return (
    <section className="relative overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 bg-[image:var(--gradient-page-hero)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,102,255,0.16),transparent_55%),radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.14),transparent_40%)]" />
      <div className="relative mx-auto flex min-h-[70dvh] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <motion.div
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={defaultTransition}
          className="w-full"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-light">Danas</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Priča se nastavlja
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/60 sm:text-lg">
            Ista strast. Nova generacija. Uđi u sljedeće poglavlje — na terenu ili u tribinama.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/tim"
              className="inline-flex rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-primary/90"
            >
              Prvi tim
            </Link>
            <Link
              to="/clanstvo"
              className="inline-flex rounded-full border border-white/15 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:border-primary/40 hover:text-white"
            >
              Članstvo
            </Link>
          </div>
          <Link
            to="/o-klubu/kuca-slavnih"
            className="group mt-10 block rounded-[2rem] border border-amber-300/20 bg-surface-story/90 p-4 text-left shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-amber-200/35 sm:p-5"
          >
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="grid min-h-[17rem] gap-4 sm:grid-cols-[1.15fr_0.85fr]">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/80">
                  {leadImage ? (
                    <img src={leadImage} alt="" className="h-full min-h-[17rem] w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-[17rem] items-center justify-center bg-[linear-gradient(140deg,#0f172a,#1d4ed8)] text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                      O klubu
                    </div>
                  )}
                </div>
                <div className="grid gap-4">
                  <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/70">
                    {supportImage ? (
                      <img src={supportImage} alt="" className="h-32 w-full object-cover sm:h-full sm:min-h-[8rem]" />
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-[linear-gradient(180deg,#0f172a,#1e293b)] text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60 sm:h-full sm:min-h-[8rem]">
                        Era
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden rounded-[1.5rem] border border-amber-300/25 bg-wood-dark">
                    {hallImage ? (
                      <img src={hallImage} alt="" className="h-32 w-full object-cover sm:h-full sm:min-h-[8rem]" />
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-[linear-gradient(180deg,#1f1508,#4b320d)] text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/75 sm:h-full sm:min-h-[8rem]">
                        Kuća slavnih
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center rounded-[1.5rem] border border-white/10 bg-white/5 p-6 sm:p-8">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-100">
                  <Landmark className="h-3.5 w-3.5" />
                  Baština
                </div>
                <h3 className="font-display mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Otključaj Kuću slavnih
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                  Završetak priče vodi u prostor posvećen legendama kluba, njihovim licima, erama i tragovima koje su ostavili.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">
                  Uđi u baštinu
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
