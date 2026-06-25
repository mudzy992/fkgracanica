import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMatches } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
    <section className="bg-surface py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-2xl font-bold text-text">{config.title ?? t('home.lastResult')}</h2>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : last ? (
          <Link to={`/utakmice/${last.id}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-3xl font-bold">
                  {last.homeClub?.shortName ?? last.homeClub?.name} {last.homeScore} : {last.awayScore}{' '}
                  {last.awayClub?.shortName ?? last.awayClub?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-text-muted">{formatDateTime(last.scheduledAt)}</CardContent>
            </Card>
          </Link>
        ) : (
          <p className="text-text-muted">{t('common.noResults')}</p>
        )}
      </div>
    </section>
  );
}
