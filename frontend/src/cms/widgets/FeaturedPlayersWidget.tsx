import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOwnClub, usePlayers } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { playerPath } from '../../lib/public-routes';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['featured-players'] };

export function FeaturedPlayersWidget({ config }: Props) {
  const { t } = useTranslation();
  const { data: ownClub } = useOwnClub();
  const { data, isLoading } = usePlayers({ clubId: ownClub?.id, activeOnly: true });
  const players = (data ?? []).slice(0, config.limit);
  const title = config.title ?? t('home.featuredPlayers');
  const viewAll = config.viewAllUrl ?? '/tim';

  return (
    <section className="bg-surface py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text">{title}</h2>
          <Link to={viewAll}>
            <Button variant="ghost">{t('actions.viewAll')}</Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: config.limit }).map((_, i) => <Skeleton key={i} className="h-48" />)
            : players.length
              ? players.map((player) => (
                  <Link key={player.id} to={playerPath(player.id)}>
                    <Card className="overflow-hidden text-center transition hover:shadow-md">
                    {player.photoPath ? (
                      <img src={mediaUrl(player.photoPath, 'medium')} alt="" className="h-32 w-full object-cover" />
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
                  </Link>
                ))
              : <p className="col-span-full text-center text-sm text-text-muted">Nema aktivnih igrača.</p>}
        </div>
      </div>
    </section>
  );
}
