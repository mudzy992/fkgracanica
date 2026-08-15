import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import { BrowserFrame } from '../frames/BrowserFrame';
import { PhoneFrame } from '../frames/PhoneFrame';
import { MockAdmin } from '../mocks/MockAdmin';
import { MockPhoneHome } from '../mocks/MockPhoneHome';
import { MockPortal } from '../mocks/MockPortal';
import type { ShowcaseSection } from '../types';
import { SectionIntro } from './SectionIntro';

type Props = { section: ShowcaseSection; index: number };

const SURFACES = [
  { title: 'Javni web', caption: 'Navijači, vijesti, live, članstvo' },
  { title: 'Admin', caption: 'CMS, kadar, liga, blagajna' },
  { title: 'Mobile', caption: 'Navijač i osoblje na terenu' },
] as const;

export function SurfacesSection({ section, index }: Props) {
  return (
    <AnimatedSection index={index} className="py-20 sm:py-28" id="povrsine">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionIntro kicker="Tri površine" title={section.title} body={section.body} chapter={index} />
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <figure>
            <BrowserFrame>
              <MockPortal />
            </BrowserFrame>
            <Fig {...SURFACES[0]} />
          </figure>
          <figure>
            <BrowserFrame>
              <MockAdmin />
            </BrowserFrame>
            <Fig {...SURFACES[1]} />
          </figure>
          <figure className="flex flex-col items-center">
            <PhoneFrame className="w-[180px]">
              <MockPhoneHome />
            </PhoneFrame>
            <Fig {...SURFACES[2]} />
          </figure>
        </div>
      </div>
    </AnimatedSection>
  );
}

function Fig({ title, caption }: { title: string; caption: string }) {
  return (
    <figcaption className="mt-4 text-center">
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-blue-100/60">{caption}</p>
    </figcaption>
  );
}
