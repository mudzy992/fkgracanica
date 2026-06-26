import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSeasons } from '../../../hooks';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { Seo } from '../../../components/seo/Seo';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { RoundMatchesPanel } from './RoundMatchesPanel';
import { SeasonRoundsPanel } from './SeasonRoundsPanel';

export function SeasonHubPage() {
  const { seasonId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const selectedRoundId = params.get('roundId');
  const { data: seasons, isLoading } = useSeasons();
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'competitions.manage') || hasPermission(user?.permissions, 'matches.manage');

  const season = (seasons as { id: string; name: string; yearStart: number; yearEnd: number; isActive?: boolean; competition?: { name: string } }[] | undefined)?.find((s) => s.id === seasonId);

  if (isLoading) return <Skeleton className="mx-4 mt-8 h-64" />;
  if (!season) return <p className="p-8 text-text-muted">Sezona nije pronađena.</p>;

  return (
    <div className="space-y-6 pb-8">
      <Seo title={season.name} />
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/admin/competitions">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{season.name}</h1>
            {season.isActive && <Badge variant="success">Aktivna</Badge>}
          </div>
          <p className="text-sm text-text-muted">
            {(season as { competition?: { name: string } }).competition?.name ?? 'Takmičenje'} · {season.yearStart}/{season.yearEnd}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-background lg:col-span-2">
          <SeasonRoundsPanel
            seasonId={seasonId}
            selectedRoundId={selectedRoundId}
            onSelectRound={(id) => setParams({ roundId: id })}
            canManage={canManage}
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-background lg:col-span-3">
          {selectedRoundId ? (
            <RoundMatchesPanel seasonId={seasonId} roundId={selectedRoundId} canManage={canManage} />
          ) : (
            <p className="p-8 text-center text-sm text-text-muted">Odaberite kolo za upravljanje utakmicama.</p>
          )}
        </div>
      </div>
    </div>
  );
}
