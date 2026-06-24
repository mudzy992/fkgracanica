import { useSponsors } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

export function SponsorsPage() {
  const { data, isLoading } = useSponsors();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title="Sponzori" />
      <h1 className="mb-8 text-3xl font-bold">Sponzori</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          : data?.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  {s.logoPath ? (
                    <img src={mediaUrl(s.logoPath)} alt={s.name} className="h-16 object-contain" />
                  ) : (
                    <span className="text-lg font-bold">{s.name}</span>
                  )}
                  <Badge variant="muted">{s.tier}</Badge>
                  {s.websiteUrl && (
                    <a href={s.websiteUrl} target="_blank" rel="noreferrer" className="text-sm text-accent">
                      Web stranica
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
