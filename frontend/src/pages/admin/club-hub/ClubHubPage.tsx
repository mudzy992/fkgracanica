import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useClub } from '../../../hooks/use-club-hub';
import { Seo } from '../../../components/seo/Seo';
import { AdminBreadcrumbs } from '../../../components/admin/AdminBreadcrumbs';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { ClubHubPanel } from './ClubHubPanel';
import { ClubBasicTab } from './tabs/ClubBasicTab';
import { ClubStadiumTab } from './tabs/ClubStadiumTab';
import { ClubPlayersTab } from './tabs/ClubPlayersTab';
import { ClubFormationTab } from './tabs/ClubFormationTab';
import { ClubStatsTab } from './tabs/ClubStatsTab';

const TABS = [
  { id: 'basic', label: 'Osnovno' },
  { id: 'stadium', label: 'Stadion' },
  { id: 'players', label: 'Igrači' },
  { id: 'formation', label: 'Formacija' },
  { id: 'stats', label: 'Statistike' },
] as const;

export function ClubHubPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { data: club, isLoading } = useClub(id);
  const tab = params.get('tab') ?? 'basic';

  if (isLoading) return <Skeleton className="mx-4 mt-8 h-64" />;
  if (!club) return <p className="p-8 text-text-muted">{t('admin.clubHub.notFound')}</p>;

  return (
    <div className="space-y-6 pb-8">
      <Seo title={club.name} />
      <AdminBreadcrumbs
        items={[
          { label: 'Admin', to: '/admin' },
          { label: 'Klub', to: '/admin/clubs' },
          { label: club.name },
        ]}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/admin/clubs">
          <Button variant="ghost" size="icon" aria-label={t('actions.back')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{club.name}</h1>
            {club.isOwnClub ? (
              <Badge variant="success">{t('admin.club.ownClub')}</Badge>
            ) : (
              <Badge variant="muted">{t('admin.clubsList.opponent')}</Badge>
            )}
          </div>
          <p className="text-sm text-text-muted">
            Upravljanje klubom, kadrom, stadionom i statistikama
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-3">
        {TABS.map((t) => (
          <Button
            key={t.id}
            type="button"
            variant={tab === t.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setParams({ tab: t.id })}
          >
            {t.label}
          </Button>
        ))}
      </div>
      <ClubHubPanel>
        {tab === 'basic' && <ClubBasicTab club={club} />}
        {tab === 'stadium' && <ClubStadiumTab clubId={club.id} />}
        {tab === 'players' && <ClubPlayersTab clubId={club.id} />}
        {tab === 'formation' && <ClubFormationTab clubId={club.id} />}
        {tab === 'stats' && <ClubStatsTab clubId={club.id} />}
      </ClubHubPanel>
    </div>
  );
}
