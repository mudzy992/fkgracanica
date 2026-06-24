import { useTrophies } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

export function TrophiesPage() {
  const { data, isLoading } = useTrophies();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title="Trofeji" />
      <h1 className="mb-8 text-3xl font-bold">Trofeji</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)
          : data?.map((t) => (
              <Card key={t.id}>
                <CardContent className="flex gap-4 p-6">
                  {t.imagePath && (
                    <img src={mediaUrl(t.imagePath)} alt="" className="h-20 w-20 object-contain" />
                  )}
                  <div>
                    <p className="text-2xl font-bold text-primary">{t.year}</p>
                    <p className="font-semibold">{t.name}</p>
                    {t.competition && <p className="text-sm text-text-muted">{t.competition}</p>}
                    {t.description && <p className="mt-2 text-sm text-text-muted">{t.description}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
