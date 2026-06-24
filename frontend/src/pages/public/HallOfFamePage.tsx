import { useHallOfFame } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

export function HallOfFamePage() {
  const { data, isLoading } = useHallOfFame();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title="Hall of Fame" />
      <h1 className="mb-8 text-3xl font-bold">Hall of Fame</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)
          : data?.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-6 text-center">
                  {entry.photoPath ? (
                    <img
                      src={mediaUrl(entry.photoPath)}
                      alt=""
                      className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                      {entry.name[0]}
                    </div>
                  )}
                  <h2 className="text-lg font-bold">{entry.name}</h2>
                  {entry.role && <p className="text-sm text-primary">{entry.role}</p>}
                  {entry.years && <p className="text-sm text-text-muted">{entry.years}</p>}
                  {entry.bio && <p className="mt-2 text-sm text-text-muted">{entry.bio}</p>}
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
