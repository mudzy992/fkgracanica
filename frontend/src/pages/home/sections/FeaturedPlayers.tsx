import { useTranslation } from 'react-i18next';
import { usePlayers } from '../../../hooks';
import { mediaUrl } from '../../../lib/media';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';

export function FeaturedPlayers() {
  const { t } = useTranslation();
  const { data, isLoading } = usePlayers();
  const players = data?.filter((p) => p.isActive).slice(0, 4) ?? [];

  return (
    <section className="bg-surface py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-2xl font-bold text-text">{t('home.featuredPlayers')}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)
            : players.map((player) => (
                <Card key={player.id} className="overflow-hidden text-center">
                  {player.photoPath ? (
                    <img loading="lazy" decoding="async"
                      src={mediaUrl(player.photoPath)}
                      alt=""
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                      {player.number ?? '?'}
                    </div>
                  )}
                  <CardContent className="p-4">
                    <p className="font-semibold">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="text-sm text-text-muted">{player.position}</p>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </section>
  );
}
