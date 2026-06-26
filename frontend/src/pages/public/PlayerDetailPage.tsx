import { Link, useParams } from 'react-router-dom';
import { usePlayerPublic } from '../../hooks/use-club-public';
import { mediaUrl } from '../../lib/media';
import { clubPath } from '../../lib/public-routes';
import { POSITION_LABELS } from '../../lib/player-utils';
import { ClubCrest } from '../../components/public/clubs/ClubCrest';
import { Seo } from '../../components/seo/Seo';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
import { Skeleton } from '../../components/ui/skeleton';

function StatBox({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <PremiumCard className="p-4 text-center" hover={false}>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-2xl font-bold text-text">{value ?? 0}</p>
    </PremiumCard>
  );
}

export function PlayerDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading, isError } = usePlayerPublic(id);

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-96 max-w-3xl" />;
  if (isError || !data) {
    return <p className="p-12 text-center text-text-muted">Igrač nije pronađen.</p>;
  }

  const pos = data.position
    ? POSITION_LABELS[data.position as keyof typeof POSITION_LABELS] ?? data.position
    : null;

  return (
    <div className="pb-20">
      <Seo title={`${data.firstName} ${data.lastName}`} description={data.bio ?? undefined} />
      <header className="border-b border-[var(--border-subtle)] bg-[image:var(--gradient-page-hero)]">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-10 text-center sm:px-6 sm:py-14 md:flex-row md:text-left">
          {data.photoPath ? (
            <img
              src={mediaUrl(data.photoPath, 'medium')}
              alt=""
              className="h-36 w-36 rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-primary/10 text-4xl font-bold text-primary">
              {data.number ?? '?'}
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-accent">Igrač</p>
            <h1 className="text-4xl font-bold text-text">
              {data.firstName} {data.lastName}
            </h1>
            <p className="text-lg text-text-muted">
              {data.number != null && `#${data.number}`}
              {pos && ` · ${pos}`}
            </p>
            {data.club && (
              <Link to={clubPath(data.club.slug)} className="inline-flex items-center gap-2 text-primary hover:underline">
                <ClubCrest club={data.club} size="sm" />
                {data.club.name}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-10 px-4 pt-10 sm:px-6">
        {data.bio && (
          <PremiumCard className="p-6">
            <h2 className="mb-3 text-lg font-semibold">O igraču</h2>
            <p className="text-text-muted leading-relaxed">{data.bio}</p>
          </PremiumCard>
        )}

        {data.season && (
          <section>
            <h2 className="mb-4 text-xl font-bold">Sezona {data.season.name}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatBox label="Nastupi" value={data.seasonStats?.appearances} />
              <StatBox label="Golovi" value={data.seasonStats?.goals} />
              <StatBox label="Asist." value={data.seasonStats?.assists} />
              <StatBox label="Minute" value={data.seasonStats?.minutes} />
              <StatBox label="Žuti" value={data.seasonStats?.yellowCards} />
              <StatBox label="Crveni" value={data.seasonStats?.redCards} />
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-xl font-bold">Karijera (ukupno)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatBox label="Nastupi" value={data.careerTotals?.appearances} />
            <StatBox label="Golovi" value={data.careerTotals?.goals} />
            <StatBox label="Asist." value={data.careerTotals?.assists} />
            <StatBox label="Minute" value={data.careerTotals?.minutes} />
            <StatBox label="Žuti" value={data.careerTotals?.yellowCards} />
            <StatBox label="Crveni" value={data.careerTotals?.redCards} />
          </div>
        </section>
      </div>
    </div>
  );
}
