import { Link } from 'react-router-dom';
import { adminLinkClass } from '../../lib/admin-styles';
import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCompetitions, useSeasons } from '../../hooks';
import { useDeleteCompetition } from '../../hooks/use-competition-admin';
import { useDeleteSeason } from '../../hooks/use-season-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
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

  const compList = (competitions as Competition[] | undefined) ?? [];
  const seasonList = (seasons as Season[] | undefined) ?? [];

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
              <Button size="sm" variant="outline" onClick={() => openForm('competition', null, null)}>
                <Plus className="mr-1 h-4 w-4" />
                Katalog
              </Button>
              <Button size="sm" onClick={() => openForm('season', null, null)}>
                <Plus className="mr-1 h-4 w-4" />
                Sezona
              </Button>
            </div>
          ) : undefined
        }
      >
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">Sezone</h2>
        <AdminDataTable
          rows={seasonList}
          empty="Nema sezona."
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'years', header: 'Period', render: (r) => `${r.yearStart}–${r.yearEnd}` },
            {
              key: 'editions',
              header: 'Takmičenja',
              render: (r) => {
                const n = (r as Season & { competitions?: unknown[] }).competitions?.length ?? 0;
                return n ? <Badge variant="muted">{n}</Badge> : <span className="text-text-muted">—</span>;
              },
            },
            {
              key: 'hub',
              header: '',
              render: (r) => (
                <Link to={`/admin/seasons/${r.id}`} className={`text-sm ${adminLinkClass}`}>
                  Otvori
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
                      <Button variant="ghost" size="icon" onClick={() => openForm('season', null, r)} aria-label="Uredi">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void onDeleteSeason(r)} aria-label="Obriši">
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  ),
                }]
              : []),
          ]}
        />
        <h2 className="border-b border-t border-slate-200 px-4 py-3 text-sm font-semibold">Katalog takmičenja</h2>
        <AdminDataTable
          rows={compList}
          empty="Nema takmičenja."
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'slug', header: 'Slug', render: (r) => r.slug },
            {
              key: 'league',
              header: 'Liga',
              render: (r) =>
                r.isLeague ? <Badge variant="success">Liga</Badge> : <Badge variant="muted">Ostalo</Badge>,
            },
            ...(canManage
              ? [{
                  key: 'actions',
                  header: 'Akcije',
                  render: (r: Competition) => (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openForm('competition', r, null)} aria-label="Uredi">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void onDeleteComp(r)} aria-label="Obriši">
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
