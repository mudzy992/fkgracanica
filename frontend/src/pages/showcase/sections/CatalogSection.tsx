import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import { StatusBadge } from '../StatusBadge';
import type { ShowcaseModule, ShowcaseSection } from '../types';
import { SectionIntro } from './SectionIntro';
import { SectionVisual } from './SectionVisual';

type Props = {
  section: ShowcaseSection;
  modules: ShowcaseModule[];
  index: number;
};

export function CatalogSection({ section, modules, index }: Props) {
  const related = (section.moduleIds ?? [])
    .map((id) => modules.find((m) => m.id === id))
    .filter((m): m is ShowcaseModule => !!m);
  const visual = <SectionVisual id={section.id} />;

  return (
    <AnimatedSection index={index} className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div className={visual ? '' : 'lg:col-span-2'}>
          <SectionIntro kicker="Platforma" title={section.title} body={section.body} chapter={index} />
          {section.bullets?.length ? (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {section.bullets.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-blue-50 transition hover:border-blue-400/30"
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
        {visual ? <div className="lg:pl-4">{visual}</div> : null}
      </div>
    </AnimatedSection>
  );
}
