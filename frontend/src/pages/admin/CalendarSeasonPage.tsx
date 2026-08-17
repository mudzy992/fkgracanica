import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSeasons } from '../../hooks';
import { useDeleteSeasonCompetition } from '../../hooks/use-season-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { AdminDataTable } from '../../components/admin/AdminPageShell';
import { adminLinkClass } from '../../lib/admin-styles';
import { type CalendarSeason } from '../../lib/season-utils';
import { SeasonEditionFormSheet, type SeasonEditionRow } from './SeasonEditionFormSheet';

export function CalendarSeasonPage() {
  const { seasonId = '' } = useParams();
  const { data: seasons, isLoading } = useSeasons();
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'competitions.manage');
  const deleteEdition = useDeleteSeasonCompetition();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<SeasonEditionRow | null>(null);

  const season = ((seasons as CalendarSeason[] | undefined) ?? []).find((s) => s.id === seasonId);
  const rows = (season?.competitions as SeasonEditionRow[] | undefined) ?? [];

  const onDelete = async (item: SeasonEditionRow) => {
    const ok = await confirm({
      title: 'Ukloniti takmičenje iz sezone?',
      description: item.competition?.name ?? item.id,
      variant: 'danger',
      confirmLabel: 'Ukloni',
    });
    if (ok) void deleteEdition.mutateAsync({ seasonId, editionId: item.id });
  };

  if (isLoading) return <Skeleton className="mx-4 mt-8 h-64" />;
  if (!season) return <p className="p-8 text-text-muted">Sezona nije pronađena.</p>;

  return (
    <div className="space-y-6 pb-8">
      <Seo title={season.name} />
      {dialog}
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/admin/competitions">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{season.name}</h1>
            {season.isActive && <Badge variant="success">Aktivna</Badge>}
          </div>
          <p className="text-sm text-text-muted">{season.yearStart}/{season.yearEnd}</p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
            <Plus className="mr-1 h-4 w-4" />
            Takmičenje
          </Button>
        )}
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-background">
        <AdminDataTable
          rows={rows}
          empty="Nema takmičenja u ovoj sezoni."
          columns={[
            { key: 'name', header: 'Takmičenje', render: (r) => r.competition?.name ?? '—' },
            {
              key: 'league',
              header: 'Liga',
              render: (r) =>
                r.competition?.isLeague ? <Badge variant="success">Liga</Badge> : <Badge variant="muted">Ostalo</Badge>,
            },
            {
              key: 'participants',
              header: 'Učesnici',
              render: (r) => r.participants?.length ?? 0,
            },
            {
              key: 'hub',
              header: 'Kola',
              render: (r) => (
                <Link
                  to={`/admin/seasons/${seasonId}/competitions/${r.id}`}
                  className={`text-sm ${adminLinkClass}`}
                >
                  Upravljaj
                </Link>
              ),
            },
            ...(canManage
              ? [{
                  key: 'actions',
                  header: 'Akcije',
                  render: (r: SeasonEditionRow) => (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEdit(r); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void onDelete(r)}>
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  ),
                }]
              : []),
          ]}
        />
      </div>
      <SeasonEditionFormSheet
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}
        seasonId={seasonId}
        editEdition={edit}
      />
    </div>
  );
}
