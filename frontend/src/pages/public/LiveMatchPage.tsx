import { useParams } from 'react-router-dom';
import { useMatch } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

export function LiveMatchPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useMatch(id ?? '');

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-96 max-w-3xl" />;
  if (!data) return <p className="p-12 text-center">Utakmica nije pronađena.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Seo title="Live" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live</h1>
        <Badge variant="danger">{data.minute}&apos;</Badge>
      </div>
      <div className="rounded-xl bg-primary p-6 text-center text-white">
        <p className="text-lg">
          {data.homeClub?.name} {data.homeScore} : {data.awayScore} {data.awayClub?.name}
        </p>
      </div>
      <div className="mt-8 space-y-3">
        {data.events?.map((ev) => (
          <div key={ev.id} className="rounded-lg border border-slate-200 p-3 text-sm">
            <span className="font-bold text-primary">{ev.minute}&apos;</span> {ev.type}
            {ev.description && ` — ${ev.description}`}
          </div>
        ))}
        {(!data.events || data.events.length === 0) && (
          <p className="text-center text-text-muted">Nema događaja za prikaz.</p>
        )}
      </div>
    </div>
  );
}
