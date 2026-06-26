import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGalleryItem, useGalleryList } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { Card } from '../../components/ui/card';
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
  const viewAllLabel = config.viewAllLabel ?? t('actions.viewAll');

  if (isSingle && single?.photos?.length) {
    return (
      <section className="bg-surface py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text">{title || single.title}</h2>
            <Link to={`/galerija/${single.slug}`}>
              <Button variant="ghost">{viewAllLabel}</Button>
            </Link>
          </div>
          <PhotoGridWithLightbox photos={single.photos.slice(0, config.limit)} columns="three" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text">{title}</h2>
          <Link to={viewAll}>
            <Button variant="ghost">{viewAllLabel}</Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: config.limit }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((g) => {
                const cover = g.photos?.[0]?.path;
                return (
                  <Link key={g.id} to={`/galerija/${g.slug}`}>
                    <Card className="overflow-hidden">
                      {cover ? (
                        <img src={mediaUrl(cover, 'medium')} alt="" className="aspect-square object-cover" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center bg-primary/5 text-sm text-text-muted">
                          {g.title}
                        </div>
                      )}
                    </Card>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
