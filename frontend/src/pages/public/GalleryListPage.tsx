import { Link } from 'react-router-dom';
import { useGalleryList } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { EmptyState } from '../../components/public/EmptyState';
import { PageContainer } from '../../components/public/PageContainer';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
import { Reveal } from '../../lib/motion/Reveal';
import { Seo } from '../../components/seo/Seo';
import { SkeletonCard } from '../../components/ui/skeleton';

export function GalleryListPage() {
  const { data, isLoading } = useGalleryList();

  return (
    <div className="pb-16">
      <Seo title="Galerija" />
      <PageHeroHeader eyebrow="Mediji" title="Galerija" subtitle="Fotografije s utakmica, događaja i iza kulisa." />
      <PageContainer className="py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.map((g, i) => {
                const cover = g.photos?.[0]?.path;
                return (
                  <Reveal key={g.id} delay={i * 0.05}>
                    <Link to={`/galerija/${g.slug}`} className="group block">
                      <PremiumCard className="overflow-hidden p-0">
                        {cover ? (
                          <img
                            src={mediaUrl(cover, 'medium')}
                            alt=""
                            className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex aspect-video items-center justify-center bg-surface p-4 text-center">
                            {g.title}
                          </div>
                        )}
                        <p className="p-4 font-medium">{g.title}</p>
                      </PremiumCard>
                    </Link>
                  </Reveal>
                );
              })}
        </div>
        {!isLoading && !data?.length && <EmptyState message="Nema objavljenih galerija." />}
      </PageContainer>
    </div>
  );
}
