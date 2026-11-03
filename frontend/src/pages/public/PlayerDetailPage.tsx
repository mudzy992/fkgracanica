import { useParams } from 'react-router-dom';
import { usePlayerPublic } from '../../hooks/use-club-public';
import { PlayerCinematicHero } from '../../components/team/PlayerCinematicHero';
import { PlayerMatchHistory } from './team/PlayerMatchHistory';
import { NewsSectionTitle } from '../../components/news/NewsSectionTitle';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';

function StatKpi({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'glass-premium rounded-xl p-4 text-center',
        highlight && 'border-gradient-club glow-blue',
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
      <p className="font-display mt-2 text-2xl font-bold text-white">{value ?? 0}</p>
    </div>
  );
}

export function PlayerDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading, isError } = usePlayerPublic(id);

  if (isLoading) {
    return (
      <div className="pb-16">
        <Skeleton className="h-[55vh] w-full rounded-none" />
        <Skeleton className="mx-auto mt-10 h-48 max-w-4xl" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="p-12 text-center text-text-muted">Igrač nije pronađen.</p>;
  }

  const seasonStats = [
    ['Nastupi', data.seasonStats?.appearances],
    ['Golovi', data.seasonStats?.goals, true],
    ['Asist.', data.seasonStats?.assists],
    ['Minute', data.seasonStats?.minutes],
    ['Žuti', data.seasonStats?.yellowCards],
    ['Crveni', data.seasonStats?.redCards],
  ] as const;

  return (
    <div className="pb-20">
      <Seo title={`${data.firstName} ${data.lastName}`} description={data.bio ?? undefined} />
      <PlayerCinematicHero player={data} />

      <div className="mx-auto max-w-4xl space-y-12 px-4 pt-10 sm:px-6">
        {data.bio && (
          <div className="glass-premium rounded-2xl p-6 sm:p-8">
            <NewsSectionTitle>O igraču</NewsSectionTitle>
            <p className="leading-relaxed text-text-muted">{data.bio}</p>
          </div>
        )}

        {data.season && (
          <section>
            <NewsSectionTitle>Sezona {data.season.name}</NewsSectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {seasonStats.map(([label, value, highlight]) => (
                <StatKpi key={label} label={label} value={value} highlight={highlight === true} />
              ))}
            </div>
          </section>
        )}

        <section>
          <NewsSectionTitle>Karijera (ukupno)</NewsSectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatKpi label="Nastupi" value={data.careerTotals?.appearances} />
            <StatKpi label="Golovi" value={data.careerTotals?.goals} highlight />
            <StatKpi label="Asist." value={data.careerTotals?.assists} />
            <StatKpi label="Minute" value={data.careerTotals?.minutes} />
            <StatKpi label="Žuti" value={data.careerTotals?.yellowCards} />
            <StatKpi label="Crveni" value={data.careerTotals?.redCards} />
          </div>
        </section>

        <PlayerMatchHistory playerId={id} />
      </div>
    </div>
  );
}
