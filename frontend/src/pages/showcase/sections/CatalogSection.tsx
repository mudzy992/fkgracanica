import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import { StatusBadge } from '../StatusBadge';
import type { ShowcaseModule, ShowcaseSection } from '../types';

type Props = {
  section: ShowcaseSection;
  modules: ShowcaseModule[];
  index: number;
};

export function CatalogSection({ section, modules, index }: Props) {
  const related = (section.moduleIds ?? [])
    .map((id) => modules.find((m) => m.id === id))
    .filter((m): m is ShowcaseModule => !!m);

  return (
    <AnimatedSection index={index} className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">Platforma</p>
        <h2 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">{section.title}</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-blue-100/80 sm:text-lg">{section.body}</p>
        {section.bullets?.length ? (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {section.bullets.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-blue-50"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        {related.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
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
