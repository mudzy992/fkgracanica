import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMatches } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Reveal } from '../../lib/motion/Reveal';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['last-result'] };

export function LastResultWidget({ config }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useMatches();
  const last = data
    ?.filter((m) => m.status === 'FINISHED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0];

  return (
    <section className="bg-surface/80 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="mb-8 text-3xl font-bold tracking-tight text-text">{config.title ?? t('home.lastResult')}</h2>
        </Reveal>
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : last ? (
          <Reveal delay={0.1}>
            <Link to={`/utakmice/${last.id}`} className="group block">
              <Card className="glass-card overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-premium">
                <CardContent className="p-6 text-center sm:p-10">
                  <p className="text-sm uppercase tracking-widest text-text-muted">Rezultat</p>
                  <p className="mt-4 text-4xl font-bold tabular-nums text-primary sm:text-5xl">
                    {last.homeScore} : {last.awayScore}
                  </p>
                  <p className="mt-4 text-lg font-semibold text-text">
                    {last.homeClub?.shortName ?? last.homeClub?.name} — {last.awayClub?.shortName ?? last.awayClub?.name}
                  </p>
                  <p className="mt-2 text-sm text-text-muted">{formatDateTime(last.scheduledAt)}</p>
                </CardContent>
              </Card>
            </Link>
          </Reveal>
        ) : (
          <p className="text-text-muted">{t('common.noResults')}</p>
        )}
      </div>
    </section>
  );
}
