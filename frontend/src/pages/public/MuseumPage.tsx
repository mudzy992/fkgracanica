import { useMuseum } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

export function MuseumPage() {
  const { data, isLoading } = useMuseum();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title="Muzej" />
      <h1 className="mb-8 text-3xl font-bold">Muzej</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)
          : data?.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {item.imagePath && (
                  <img src={mediaUrl(item.imagePath)} alt="" className="h-40 w-full object-cover" />
                )}
                <CardContent className="p-4">
                  {item.year && <p className="text-sm font-bold text-primary">{item.year}</p>}
                  <h2 className="font-semibold">{item.title}</h2>
                  {item.description && <p className="mt-2 text-sm text-text-muted">{item.description}</p>}
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
