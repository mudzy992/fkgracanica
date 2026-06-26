import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMatches } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Reveal } from '../../lib/motion/Reveal';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { matchRoundLabel } from '../../lib/round-utils';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['next-match'] };

export function NextMatchWidget({ config }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useMatches();
  const next = data
    ?.filter((m) => m.status === 'SCHEDULED' && new Date(m.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <Reveal>
        <h2 className="mb-8 text-3xl font-bold tracking-tight text-text">{config.title ?? t('home.nextMatch')}</h2>
      </Reveal>
      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : next ? (
        <Reveal delay={0.1}>
          <Link to={`/utakmice/${next.id}`} className="group block">
            <Card className="glass-card overflow-hidden border-primary/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-premium">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <Badge className="animate-pulse-soft">{matchRoundLabel(next) ?? 'Sljedeća utakmica'}</Badge>
                </div>
                <p className="text-center text-2xl font-bold text-text sm:text-3xl">
                  {next.homeClub?.name ?? 'Domaćin'}
                  <span className="mx-3 text-primary">vs</span>
                  {next.awayClub?.name ?? 'Gost'}
                </p>
                <p className="mt-4 text-center text-text-muted">{formatDateTime(next.scheduledAt)}</p>
                {next.venue && <p className="mt-1 text-center text-sm text-text-muted">{next.venue}</p>}
              </CardContent>
            </Card>
          </Link>
        </Reveal>
      ) : (
        <p className="text-text-muted">{t('common.noResults')}</p>
      )}
    </section>
  );
}
