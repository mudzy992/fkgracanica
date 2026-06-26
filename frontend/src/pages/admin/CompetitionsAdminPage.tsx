import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCompetitions, useSeasons } from '../../hooks';
import { useDeleteCompetition, useDeleteSeason } from '../../hooks/use-competition-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { EntitySelect } from '../../components/admin/EntitySelect';
import {
  CompetitionsAdminFormSheet,
  type Competition,
  type CompetitionFormMode,
  type Season,
} from './CompetitionsAdminFormSheet';

export function CompetitionsAdminPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'competitions.manage');
  const { data: competitions, isLoading: cl } = useCompetitions();
  const { data: seasons, isLoading: sl } = useSeasons();
  const deleteComp = useDeleteCompetition();
  const deleteSeason = useDeleteSeason();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CompetitionFormMode>(null);
  const [editComp, setEditComp] = useState<Competition | null>(null);
  const [editSeason, setEditSeason] = useState<Season | null>(null);
  const [seasonFilter, setSeasonFilter] = useState('');

  const compList = (competitions as Competition[] | undefined) ?? [];
  const seasonList = ((seasons as Season[] | undefined) ?? []).filter(
    (s) => !seasonFilter || s.competitionId === seasonFilter,
  );
  const compName = (id: string) => compList.find((c) => c.id === id)?.name ?? '—';

  const openForm = (m: CompetitionFormMode, comp: Competition | null, season: Season | null) => {
    setMode(m);
    setEditComp(comp);
    setEditSeason(season);
    setOpen(true);
  };

  const onDeleteComp = async (item: Competition) => {
    const ok = await confirm({ title: 'Obrisati takmičenje?', description: item.name, variant: 'danger', confirmLabel: 'Obriši' });
    if (ok) void deleteComp.mutateAsync(item.id);
  };

  const onDeleteSeason = async (item: Season) => {
    const ok = await confirm({ title: 'Obrisati sezonu?', description: item.name, variant: 'danger', confirmLabel: 'Obriši' });
    if (ok) void deleteSeason.mutateAsync(item.id);
  };

  return (
    <>
      <Seo title="Takmičenja" />
      {dialog}
      <AdminPageShell
        title="Takmičenja"
        isLoading={cl || sl}
        actions={
          canManage ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => openForm('competition', null, null)}>
                <Plus className="mr-1 h-4 w-4" />
                Takmičenje
              </Button>
              <Button size="sm" variant="outline" onClick={() => openForm('season', null, null)}>
                <Plus className="mr-1 h-4 w-4" />
                Sezona
              </Button>
            </div>
          ) : undefined
        }
      >
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">Takmičenja</h2>
        <AdminDataTable
          rows={compList}
          empty="Nema takmičenja."
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'slug', header: 'Slug', render: (r) => r.slug },
            ...(canManage
              ? [{
                  key: 'actions',
                  header: 'Akcije',
                  render: (r: Competition) => (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openForm('competition', r, null)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void onDeleteComp(r)}>
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  ),
                }]
              : []),
          ]}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-t border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold">Sezone</h2>
          <EntitySelect
            label="Filter takmičenja"
            value={seasonFilter}
            onChange={setSeasonFilter}
            placeholder="Sva takmičenja"
            options={compList.map((c) => ({ id: c.id, label: c.name }))}
          />
        </div>
        <AdminDataTable
          rows={seasonList}
          empty="Nema sezona."
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'competition', header: 'Takmičenje', render: (r) => compName(r.competitionId) },
            { key: 'years', header: 'Period', render: (r) => `${r.yearStart}–${r.yearEnd}` },
            {
              key: 'hub',
              header: 'Kola & utakmice',
              render: (r) => (
                <Link to={`/admin/competitions/seasons/${r.id}`} className="text-sm font-medium text-primary hover:underline">
                  Upravljaj
                </Link>
              ),
            },
            {
              key: 'active',
              header: 'Aktivna',
              render: (r) => (r.isActive ? <Badge variant="success">Da</Badge> : <Badge variant="muted">Ne</Badge>),
            },
            ...(canManage
              ? [{
                  key: 'actions',
                  header: 'Akcije',
                  render: (r: Season) => (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openForm('season', null, r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void onDeleteSeason(r)}>
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  ),
                }]
              : []),
          ]}
        />
      </AdminPageShell>
      <CompetitionsAdminFormSheet
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) { setMode(null); setEditComp(null); setEditSeason(null); } }}
        mode={mode}
        editCompetition={editComp}
        editSeason={editSeason}
      />
    </>
  );
}
