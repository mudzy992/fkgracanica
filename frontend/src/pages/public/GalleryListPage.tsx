import { Link } from 'react-router-dom';
import { useGalleryList } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { Seo } from '../../components/seo/Seo';
import { Card } from '../../components/ui/card';
import { SkeletonCard } from '../../components/ui/skeleton';

export function GalleryListPage() {
  const { data, isLoading } = useGalleryList();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title="Galerija" />
      <h1 className="mb-8 text-3xl font-bold">Galerija</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : data?.map((g) => {
              const cover = g.photos?.[0]?.path;
              return (
                <Link key={g.id} to={`/galerija/${g.slug}`}>
                  <Card className="overflow-hidden hover:shadow-md">
                    {cover ? (
                      <img src={mediaUrl(cover)} alt="" className="aspect-video object-cover" />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-surface p-4 text-center">
                        {g.title}
                      </div>
                    )}
                    <p className="p-3 font-medium">{g.title}</p>
                  </Card>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
