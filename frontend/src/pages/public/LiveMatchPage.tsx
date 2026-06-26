import { useParams, Link } from 'react-router-dom';
import { useMatch } from '../../hooks';
import { useMatchRealtime } from '../../hooks/use-match-realtime';
import { matchEventLabel } from '../../lib/match-event-labels';
import { formatDateTime } from '../../lib/utils';
import { MatchScoreHero } from '../../components/match/MatchScoreHero';
import { PageContainer } from '../../components/public/PageContainer';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

export function LiveMatchPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useMatch(id ?? '');
  useMatchRealtime(id);

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-96 max-w-3xl" />;
  if (!data) return <p className="p-12 text-center">Utakmica nije pronađena.</p>;

  const isLive = data.status === 'LIVE';

  return (
    <div className="pb-16">
      <PageContainer size="md" className="py-10 sm:py-12">
        <Seo title="Live" />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Live centar</h1>
          <div className="flex items-center gap-2">
            {isLive && <Badge variant="danger">UŽIVO</Badge>}
            <Badge variant="muted">{data.minute}&apos;</Badge>
          </div>
        </div>
        <MatchScoreHero
          homeClub={data.homeClub}
          awayClub={data.awayClub}
          homeScore={data.homeScore}
          awayScore={data.awayScore}
          meta={`${formatDateTime(data.scheduledAt)} · ${data.status}`}
          live={isLive}
        />
        <div className="mt-8 space-y-3">
          {data.events?.map((ev) => (
            <PremiumCard key={ev.id} className="p-3 text-sm" hover={false}>
              <span className="font-bold text-primary">{ev.minute}&apos;</span> {matchEventLabel(ev.type)}
              {ev.player && ` — ${ev.player.firstName} ${ev.player.lastName}`}
              {ev.description && ` — ${ev.description}`}
            </PremiumCard>
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
      </PageContainer>
    </div>
  );
}
