import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { useOwnClub, usePlayers } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { playerPath } from '../../lib/public-routes';
import { WidgetSectionHeaderBlock } from '../../components/public/shell/WidgetSectionHeaderBlock';
import { WidgetSectionShell } from '../../components/public/shell/WidgetSectionShell';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['featured-players'] };

export function FeaturedPlayersWidget({ config }: Props) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const { data: ownClub } = useOwnClub();
  const { data, isLoading } = usePlayers({ clubId: ownClub?.id, activeOnly: true });
  const players = (data ?? []).slice(0, config.limit);
  const title = config.title ?? t('home.featuredPlayers');
  const viewAll = config.viewAllUrl ?? '/tim';

  return (
    <WidgetSectionShell id="tim">
      <WidgetSectionHeaderBlock title={title} subtitle={t('home.teamSubtitle', 'Naši igrači')} />
      <div className="mb-6 flex justify-end">
        <Link to={viewAll}>
          <Button variant="ghost" className="text-primary-light hover:text-white">
            {t('actions.viewAll')}
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: config.limit }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))
          : players.length
            ? players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={playerPath(player.id)} className="group block">
                    <div className="border-gradient-club relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface">
                      {player.photoPath ? (
                        <img loading="lazy" decoding="async"
                          src={mediaUrl(player.photoPath, 'medium')}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-primary/30 to-background font-display text-4xl font-bold text-primary-light">
                          {player.number ?? '?'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {player.number != null && (
                          <span className="font-display text-3xl font-bold text-primary-light/80">
                            {player.number}
                          </span>
                        )}
                        <p className="font-display text-sm font-bold uppercase leading-tight text-white">
                          {player.firstName}
                          <br />
                          {player.lastName}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wider text-white/50">{player.position}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            : (
              <p className="col-span-full text-center text-sm text-text-muted">Nema aktivnih igrača.</p>
            )}
      </div>
    </WidgetSectionShell>
  );
}
