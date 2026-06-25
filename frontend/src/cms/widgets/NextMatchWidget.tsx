import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMatches } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['next-match'] };

export function NextMatchWidget({ config }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useMatches();
  const next = data
    ?.filter((m) => m.status === 'SCHEDULED' && new Date(m.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold text-text">{config.title ?? t('home.nextMatch')}</h2>
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : next ? (
        <Link to={`/utakmice/${next.id}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {next.homeClub?.name ?? 'Domaćin'} vs {next.awayClub?.name ?? 'Gost'}
                </CardTitle>
                <Badge>{next.round ? `Kolo ${next.round}` : 'Utakmica'}</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-text-muted">
              <p>{formatDateTime(next.scheduledAt)}</p>
              {next.venue && <p>{next.venue}</p>}
            </CardContent>
          </Card>
        </Link>
      ) : (
        <p className="text-text-muted">{t('common.noResults')}</p>
      )}
    </section>
  );
}
