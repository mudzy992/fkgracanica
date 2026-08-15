import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import { PhoneFrame } from '../frames/PhoneFrame';
import { MockPhoneHome } from '../mocks/MockPhoneHome';
import { StatusBadge } from '../StatusBadge';
import type { ShowcaseModule, ShowcaseSection } from '../types';
import { SectionIntro } from './SectionIntro';

type Props = { section: ShowcaseSection; modules: ShowcaseModule[]; index: number };

export function MobileSection({ section, modules, index }: Props) {
  const related = (section.moduleIds ?? [])
    .map((id) => modules.find((m) => m.id === id))
    .filter((m): m is ShowcaseModule => !!m);

  return (
    <AnimatedSection index={index} className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_auto]">
        <div>
          <SectionIntro kicker="Mobile" title={section.title} body={section.body} chapter={index} />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {section.bullets?.map((item) => (
              <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-blue-50">
                {item}
              </li>
            ))}
          </ul>
          {related.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {related.map((mod) => (
                <span
                  key={mod.id}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs"
                >
                  {mod.title}
                  <StatusBadge badge={mod.badge} percent={mod.percent} />
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <PhoneFrame className="w-[200px] justify-self-center sm:w-[220px]">
          <MockPhoneHome />
        </PhoneFrame>
      </div>
    </AnimatedSection>
  );
}
