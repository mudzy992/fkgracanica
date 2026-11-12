import { useEffect } from 'react';
import { Seo } from '../../components/seo/Seo';
import { useDynamicFavicon } from '../../hooks/use-dynamic-favicon';
import { useShowcase } from '../../hooks/use-showcase';
import { ShowcaseChrome } from './ShowcaseChrome';
import { CatalogSection } from './sections/CatalogSection';
import { CtaSection } from './sections/CtaSection';
import { HeroSection } from './sections/HeroSection';
import { JourneySection } from './sections/JourneySection';
import { MobileSection } from './sections/MobileSection';
import { RoadmapSection } from './sections/RoadmapSection';
import { RolesSection } from './sections/RolesSection';
import { SurfacesSection } from './sections/SurfacesSection';
import type { ShowcasePayload, ShowcaseSection } from './types';
import './showcase-motion.css';

const CATALOG_IDS = ['identity', 'competition', 'membership-tickets', 'content', 'admin', 'club-needs'];

function pick(sections: ShowcaseSection[], id: string) {
  return sections.find((s) => s.id === id);
}

function ShowcaseBody({ data }: { data: ShowcasePayload }) {
  const surfaces = pick(data.sections, 'surfaces');
  const fan = pick(data.sections, 'fan');
  const mobile = pick(data.sections, 'mobile');
  let i = 1;
  return (
    <>
      <HeroSection club={data.club} percent={data.overallPercent} />
      {surfaces ? <SurfacesSection section={surfaces} index={i++} /> : null}
      {fan ? <JourneySection section={fan} modules={data.modules} index={i++} /> : null}
      {CATALOG_IDS.map((id) => {
        const section = pick(data.sections, id);
        if (!section) return null;
        return <CatalogSection key={id} section={section} modules={data.modules} index={i++} />;
      })}
      {mobile ? <MobileSection section={mobile} modules={data.modules} index={i++} /> : null}
      <RolesSection roles={data.roles} index={i} />
      <RoadmapSection modules={data.modules} index={i + 1} />
      <CtaSection club={data.club} index={i + 2} />
    </>
  );
}

export function ShowcasePage() {
  const { data, isLoading, isError } = useShowcase();
  useDynamicFavicon(data?.club.crestUrl);

  useEffect(() => {
    document.documentElement.classList.add('scroll-smooth');
    return () => document.documentElement.classList.remove('scroll-smooth');
  }, []);

  return (
    <div id="top" className="min-h-dvh bg-background text-white">
      <Seo
        title="Platforma u izradi"
        description="Pregled digitalne platforme FK Gračanica — web, admin i mobile."
      />
      {data ? <ShowcaseChrome club={data.club} /> : null}
      <main>
        {isLoading ? (
          <p className="px-4 py-24 text-center text-blue-200/70">Učitavanje prezentacije…</p>
        ) : null}
        {isError ? (
          <p className="px-4 py-24 text-center text-red-300">Prezentacija trenutno nije dostupna.</p>
        ) : null}
        {data ? <ShowcaseBody data={data} /> : null}
      </main>
    </div>
  );
}
