import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSeasons } from '../../../hooks';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { findEdition, type CalendarSeason } from '../../../lib/season-utils';
import { Seo } from '../../../components/seo/Seo';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { RoundMatchesPanel } from './RoundMatchesPanel';
import { SeasonRoundsPanel } from './SeasonRoundsPanel';

export function SeasonHubPage() {
  const { seasonId = '', editionId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const selectedRoundId = params.get('roundId');
  const { data: seasons, isLoading } = useSeasons();
  const { user } = useAuth();
  const canManage =
    hasPermission(user?.permissions, 'competitions.manage') ||
    hasPermission(user?.permissions, 'matches.manage');

  const found = findEdition((seasons as CalendarSeason[] | undefined) ?? [], editionId || seasonId);
  const editionKey = found?.edition.id ?? '';
  const backTo = found ? `/admin/seasons/${found.calendar.id}` : '/admin/competitions';

  if (isLoading) return <Skeleton className="mx-4 mt-8 h-64" />;
  if (!found) return <p className="p-8 text-text-muted">Takmičenje u sezoni nije pronađeno.</p>;

  return (
    <div className="space-y-6 pb-8">
      <Seo title={found.edition.competition?.name ?? found.calendar.name} />
      <div className="flex flex-wrap items-center gap-3">
        <Link to={backTo}>
          <Button variant="ghost" size="icon" aria-label="Nazad">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">
              {found.edition.competition?.name ?? 'Takmičenje'}
            </h1>
            {found.calendar.isActive && <Badge variant="success">Aktivna sezona</Badge>}
            {found.edition.competition?.isLeague && <Badge variant="success">Liga</Badge>}
          </div>
          <p className="text-sm text-text-muted">
            {found.calendar.name} · {found.calendar.yearStart}/{found.calendar.yearEnd}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-background lg:col-span-2">
          <SeasonRoundsPanel
            seasonId={editionKey}
            selectedRoundId={selectedRoundId}
            onSelectRound={(id) => (id ? setParams({ roundId: id }) : setParams({}))}
            canManage={canManage}
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-background lg:col-span-3">
          {selectedRoundId ? (
            <RoundMatchesPanel
              seasonId={editionKey}
              roundId={selectedRoundId}
              canManage={canManage}
            />
          ) : (
            <p className="p-8 text-center text-sm text-text-muted">
              Odaberite kolo za upravljanje utakmicama.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
