import { buttonVariants } from "../../../components/ui/button-variants";
import { cn } from "../../../lib/utils";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGalleryList } from '../../../hooks';
import { galleryPreviewUrl } from '../../../lib/media';
import { Card } from '../../../components/ui/card';
import { SkeletonCard } from '../../../components/ui/skeleton';
;

export function GallerySection() {
  const { t } = useTranslation();
  const { data, isLoading } = useGalleryList();
  const items = data?.slice(0, 4) ?? [];

  return (
    <section className="bg-surface py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text">{t('home.gallery')}</h2>
          <Link to="/galerija" className={cn(buttonVariants({variant: "ghost"}))}>{t('actions.viewAll')}</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((g) => {
                const cover = g.photos?.[0]?.path;
                return (
                  <Link key={g.id} to={`/galerija/${g.slug}`}>
                    <Card className="overflow-hidden">
                      {cover ? (
                        <img
                          loading="lazy"
                          decoding="async"
                          src={galleryPreviewUrl(cover)}
                          alt=""
                          className="aspect-square object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center bg-primary/5 text-sm text-text">
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
