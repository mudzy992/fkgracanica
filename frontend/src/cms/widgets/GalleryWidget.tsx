import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGalleryItem, useGalleryList } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { PublicSection } from '../../components/public/shell/PublicSection';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
import { Reveal } from '../../lib/motion/Reveal';
import { SkeletonCard } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { PhotoGridWithLightbox } from '../../components/public/PhotoGridWithLightbox';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['gallery'] };

export function GalleryWidget({ config }: Props) {
  const { t } = useTranslation();
  const isSingle = config.mode === 'single' && !!config.galleryId;
  const { data: list, isLoading: listLoading } = useGalleryList();
  const slug = list?.find((g) => g.id === config.galleryId)?.slug;
  const { data: single, isLoading: singleLoading } = useGalleryItem(isSingle && slug ? slug : '');
  const isLoading = isSingle ? listLoading || singleLoading : listLoading;
  const items = isSingle && single ? [single] : (list ?? []).slice(0, config.limit);
  const title = config.title ?? t('home.gallery');
  const viewAll = config.viewAllUrl ?? '/galerija';

  if (isSingle && single?.photos?.length) {
    return (
      <section className="bg-surface/80 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <PublicSection
            title={title || single.title}
            actions={
              <Link to={`/galerija/${single.slug}`}>
                <Button variant="ghost">{t('actions.viewAll')}</Button>
              </Link>
            }
          >
            <PhotoGridWithLightbox photos={single.photos.slice(0, config.limit)} columns="three" />
          </PublicSection>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface/80 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PublicSection
          title={title}
          actions={
            <Link to={viewAll}>
              <Button variant="ghost">{t('actions.viewAll')}</Button>
            </Link>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: config.limit }).map((_, i) => <SkeletonCard key={i} />)
              : items.map((g, i) => {
                  const cover = g.photos?.[0]?.path;
                  return (
                    <Reveal key={g.id} delay={i * 0.05}>
                      <Link to={`/galerija/${g.slug}`} className="group block">
                        <PremiumCard className="overflow-hidden p-0">
                          {cover ? (
                            <img
                              src={mediaUrl(cover, 'medium')}
                              alt=""
                              className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex aspect-square items-center justify-center bg-primary/5 text-sm text-text-muted">
                              {g.title}
                            </div>
                          )}
                        </PremiumCard>
                      </Link>
                    </Reveal>
                  );
                })}
          </div>
        </PublicSection>
      </div>
    </section>
  );
}
