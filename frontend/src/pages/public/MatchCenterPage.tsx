import { Link, useParams } from 'react-router-dom';
import { useMatch } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

export function MatchCenterPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useMatch(id ?? '');

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-96 max-w-3xl" />;
  if (isError || !data) {
    return <p className="p-12 text-center text-text-muted">Utakmica nije pronađena.</p>;
  }

  const isLive = data.status === 'LIVE' || data.status === 'HALFTIME';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Seo title={`${data.homeClub?.name} vs ${data.awayClub?.name}`} />
      <div className="mb-4 flex items-center justify-between">
        <Badge variant={isLive ? 'danger' : 'muted'}>{data.status}</Badge>
        {isLive && (
          <Link to={`/live/${data.id}`}>
            <Button size="sm">Live centar</Button>
          </Link>
        )}
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-sm text-text-muted">{formatDateTime(data.scheduledAt)}</p>
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="flex-1 text-right">
              <p className="text-lg font-bold">{data.homeClub?.name}</p>
            </div>
            <p className="text-4xl font-bold text-primary">
              {data.homeScore} : {data.awayScore}
            </p>
            <div className="flex-1 text-left">
              <p className="text-lg font-bold">{data.awayClub?.name}</p>
            </div>
          </div>
          {data.venue && <p className="mt-4 text-sm text-text-muted">{data.venue}</p>}
        </CardContent>
      </Card>

      {data.events && data.events.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Događaji</h2>
          <div className="space-y-2">
            {data.events.map((ev) => (
              <div key={ev.id} className="flex gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                <span className="font-bold text-primary">{ev.minute}&apos;</span>
                <span>
                  {ev.type}
                  {ev.player && ` — ${ev.player.firstName} ${ev.player.lastName}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
