import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import type { ShowcaseModule, ShowcaseSection } from '../types';
import { StatusBadge } from '../StatusBadge';
import { SectionIntro } from './SectionIntro';

const STEPS = [
  { n: '01', title: 'Sadržaj', hint: 'Vijesti, galerija, live semafor' },
  { n: '02', title: 'Članstvo', hint: 'Prijava, kartica, QR kod' },
  { n: '03', title: 'Ulaznica', hint: 'Stripe ili rezervacija blagajne' },
  { n: '04', title: 'Ulaz', hint: 'Osoblje skenira QR na telefonu' },
];

type Props = { section: ShowcaseSection; modules: ShowcaseModule[]; index: number };

export function JourneySection({ section, modules, index }: Props) {
  const related = (section.moduleIds ?? [])
    .map((id) => modules.find((m) => m.id === id))
    .filter((m): m is ShowcaseModule => !!m);

  return (
    <AnimatedSection index={index} variant="surface" className="py-20 sm:py-28" id="put">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionIntro kicker="Put navijača" title={section.title} body={section.body} chapter={index} />
        <ol className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute top-10 right-[8%] left-[8%] hidden h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent lg:block" />
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-blue-400/40 hover:bg-white/[0.08]"
            >
              <p className="font-display text-3xl font-bold text-blue-400/40">{step.n}</p>
              <p className="mt-3 text-lg font-semibold text-white">{step.title}</p>
              <p className="mt-1 text-sm text-blue-100/65">{step.hint}</p>
            </li>
          ))}
        </ol>
        {related.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {related.map((mod) => (
              <span
                key={mod.id}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-blue-100"
              >
                {mod.title}
                <StatusBadge badge={mod.badge} percent={mod.percent} />
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </AnimatedSection>
  );
}
