import { useParams, Link } from 'react-router-dom';
import { useMatch } from '../../hooks';
import { useMatchRealtime } from '../../hooks/use-match-realtime';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

const EVENT_LABELS: Record<string, string> = {
  GOAL: 'Gol',
  YELLOW_CARD: 'Žuti karton',
  RED_CARD: 'Crveni karton',
  SUBSTITUTION: 'Izmjena',
  KICKOFF: 'Početak',
  HALFTIME: 'Poluvrijeme',
  FULL_TIME: 'Kraj',
};

export function LiveMatchPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useMatch(id ?? '');
  useMatchRealtime(id);

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-96 max-w-3xl" />;
  if (!data) return <p className="p-12 text-center">Utakmica nije pronađena.</p>;

  const isLive = data.status === 'LIVE';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Seo title="Live" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live</h1>
        <div className="flex items-center gap-2">
          {isLive && <Badge variant="danger">UŽIVO</Badge>}
          <Badge variant="muted">{data.minute}&apos;</Badge>
        </div>
      </div>
      <div className="rounded-xl bg-primary p-6 text-center text-white">
        <p className="text-lg">
          {data.homeClub?.name} {data.homeScore} : {data.awayScore} {data.awayClub?.name}
        </p>
        <p className="mt-2 text-sm text-white/70">{data.status}</p>
      </div>
      <div className="mt-8 space-y-3">
        {data.events?.map((ev) => (
          <div key={ev.id} className="rounded-lg border border-slate-200 p-3 text-sm">
            <span className="font-bold text-primary">{ev.minute}&apos;</span>{' '}
            {EVENT_LABELS[ev.type] ?? ev.type}
            {ev.description && ` — ${ev.description}`}
          </div>
        ))}
        {(!data.events || data.events.length === 0) && (
          <p className="text-center text-text-muted">Nema događaja za prikaz.</p>
        )}
      </div>
      <p className="mt-8 text-center text-sm text-text-muted">
        <Link to={`/utakmice/${data.id}`} className="text-accent hover:underline">
          Detalji utakmice
        </Link>
      </p>
    </div>
  );
}
