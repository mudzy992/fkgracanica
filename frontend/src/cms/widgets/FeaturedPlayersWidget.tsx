import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOwnClub, usePlayers } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { playerPath } from '../../lib/public-routes';
import { Reveal } from '../../lib/motion/Reveal';
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
    <section className="bg-surface/80 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-text">{title}</h2>
          <Link to={viewAll}>
            <Button variant="ghost">{t('actions.viewAll')}</Button>
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: config.limit }).map((_, i) => <Skeleton key={i} className="h-48" />)
            : players.length
              ? players.map((player, i) => (
                  <Reveal key={player.id} delay={i * 0.06}>
                    <Link to={playerPath(player.id)} className="group block">
                      <Card className="glass-card overflow-hidden text-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-premium">
                        {player.photoPath ? (
                          <div className="overflow-hidden">
                            <img
                              src={mediaUrl(player.photoPath, 'medium')}
                              alt=""
                              className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
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
                  </Reveal>
                ))
              : <p className="col-span-full text-center text-sm text-text-muted">Nema aktivnih igrača.</p>}
        </div>
      </div>
    </section>
  );
}
