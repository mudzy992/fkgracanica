import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { useGalleryItem, useGalleryList } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { WidgetSectionHeaderBlock } from '../../components/public/shell/WidgetSectionHeaderBlock';
import { WidgetSectionShell } from '../../components/public/shell/WidgetSectionShell';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { PhotoGridWithLightbox } from '../../components/public/PhotoGridWithLightbox';
import { cn } from '../../lib/utils';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['gallery'] };

const BENTO_SPANS = [
  'col-span-2 row-span-2 min-h-[280px]',
  'col-span-1 row-span-1 min-h-[130px]',
  'col-span-1 row-span-1 min-h-[130px]',
  'col-span-1 row-span-2 min-h-[280px]',
  'col-span-1 row-span-1 min-h-[130px]',
  'col-span-2 row-span-1 min-h-[160px]',
];

export function GalleryWidget({ config }: Props) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
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
      <WidgetSectionShell id="galerija">
        <WidgetSectionHeaderBlock title={title || single.title} />
        <div className="mb-6 flex justify-end">
          <Link to={`/galerija/${single.slug}`}>
            <Button variant="ghost" className="text-primary-light hover:text-white">
              {t('actions.viewAll')}
            </Button>
          </Link>
        </div>
        <PhotoGridWithLightbox photos={single.photos.slice(0, config.limit)} columns="three" />
      </WidgetSectionShell>
    );
  }

  return (
    <WidgetSectionShell id="galerija">
      <WidgetSectionHeaderBlock title={title} subtitle={t('home.gallerySubtitle', 'Trenuci sa terena')} />
      <div className="mb-6 flex justify-end">
        <Link to={viewAll}>
          <Button variant="ghost" className="text-primary-light hover:text-white">
            {t('actions.viewAll')}
          </Button>
        </Link>
      </div>
      <div className="grid auto-rows-fr grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {isLoading
          ? Array.from({ length: Math.min(config.limit, 6) }).map((_, i) => (
              <Skeleton key={i} className={cn('min-h-[130px] rounded-2xl', i === 0 && 'col-span-2 row-span-2 min-h-[280px]')} />
            ))
          : items.map((g, i) => {
              const cover = g.photos?.[0]?.path;
              const span = BENTO_SPANS[i % BENTO_SPANS.length];
              return (
                <motion.div
                  key={g.id}
                  initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={span}
                >
                  <Link to={`/galerija/${g.slug}`} className="group relative block h-full overflow-hidden rounded-2xl">
                    {cover ? (
                      <img loading="lazy" decoding="async"
                        src={mediaUrl(cover, 'medium')}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20 text-sm text-text-muted">
                        {g.title}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80 transition group-hover:opacity-100" />
                    <p className="absolute bottom-0 left-0 right-0 p-4 font-display text-sm font-bold uppercase text-white">
                      {g.title}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
      </div>
    </WidgetSectionShell>
  );
}
