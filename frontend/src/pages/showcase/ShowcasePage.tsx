import { Seo } from '../../components/seo/Seo';
import { useDynamicFavicon } from '../../hooks/use-dynamic-favicon';
import { useShowcase } from '../../hooks/use-showcase';
import { ShowcaseChrome } from './ShowcaseChrome';
import { CatalogSection } from './sections/CatalogSection';
import { CtaSection } from './sections/CtaSection';
import { HeroSection } from './sections/HeroSection';
import { RoadmapSection } from './sections/RoadmapSection';
import { RolesSection } from './sections/RolesSection';
import type { ShowcasePayload, ShowcaseSection } from './types';

const CATALOG_IDS = [
  'surfaces',
  'fan',
  'identity',
  'competition',
  'membership-tickets',
  'content',
  'admin',
  'mobile',
  'club-needs',
];

function pick(sections: ShowcaseSection[], id: string) {
  return sections.find((s) => s.id === id);
}

function ShowcaseBody({ data }: { data: ShowcasePayload }) {
  let i = 1;
  return (
    <>
      <HeroSection club={data.club} percent={data.overallPercent} />
      {CATALOG_IDS.map((id) => {
        const section = pick(data.sections, id);
        if (!section) return null;
        const index = i;
        i += 1;
        return (
          <CatalogSection key={id} section={section} modules={data.modules} index={index} />
        );
      })}
      <RolesSection roles={data.roles} index={i} />
      <RoadmapSection modules={data.modules} index={i + 1} />
      <CtaSection club={data.club} index={i + 2} />
    </>
  );
}

export function ShowcasePage() {
  const { data, isLoading, isError } = useShowcase();
  useDynamicFavicon(data?.club.crestUrl);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#050a14] text-white">
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
