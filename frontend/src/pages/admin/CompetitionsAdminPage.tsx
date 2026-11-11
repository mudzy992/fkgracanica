import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { runAction } from '../../lib/action-errors';

export function CompetitionsAdminPage() {
  const { t } = useTranslation();
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
    /* v8 ignore next */
    if (ok) void runAction(deleteComp.mutateAsync(item.id));
  };

  const onDeleteSeason = async (item: Season) => {
    const ok = await confirm({ title: t('admin.competitionsAdmin.deleteSeason'), description: item.name, variant: 'danger', confirmLabel: t('actions.delete') });
    /* v8 ignore next */
    if (ok) void runAction(deleteSeason.mutateAsync(item.id));
  };

  return (
    <>
      <Seo title={t('admin.competitionsAdmin.metaTitle')} />
      {dialog}
      <AdminPageShell
        title={t('admin.competitionsAdmin.title')}
        isLoading={cl || sl}
        actions={
          canManage ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openForm('competition', null, null)}>
                <Plus className="mr-1 h-4 w-4" />
                {t('admin.competitionsAdmin.catalogShort')}
              </Button>
              <Button size="sm" onClick={() => openForm('season', null, null)}>
                <Plus className="mr-1 h-4 w-4" />
                {t('admin.competitionsAdmin.seasonShort')}
              </Button>
            </div>
          ) : undefined
        }
      >
        <h2 className="border-b border-[var(--border-subtle)] px-4 py-3 text-sm font-semibold">{t('admin.competitionsAdmin.seasons')}</h2>
        <AdminDataTable
          rows={seasonList}
          empty={t('admin.competitionsAdmin.emptySeasons')}
          columns={[
            { key: 'name', header: t('admin.competitionsAdmin.colName'), render: (r) => r.name },
            { key: 'years', header: t('admin.competitionsAdmin.colPeriod'), render: (r) => `${r.yearStart}–${r.yearEnd}` },
            {
              key: 'editions',
              header: t('admin.competitionsAdmin.colCompetitions'),
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
                  {t('admin.competitionsAdmin.open')}
                </Link>
              ),
            },
            {
              key: 'active',
              header: t('admin.competitionsAdmin.colActive'),
              render: (r) => (r.isActive ? <Badge variant="success">{t('admin.common.yes')}</Badge> : <Badge variant="muted">{t('admin.common.no')}</Badge>),
            },
            ...(canManage
              ? [{
                  key: 'actions',
                  header: t('admin.common.actions'),
                  render: (r: Season) => (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openForm('season', null, r)} aria-label={t('actions.edit')}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void onDeleteSeason(r)} aria-label={t('actions.delete')}>
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  ),
                }]
              : []),
          ]}
        />
        <h2 className="border-b border-t border-[var(--border-subtle)] px-4 py-3 text-sm font-semibold">{t('admin.competitionsAdmin.catalog')}</h2>
        <AdminDataTable
          rows={compList}
          empty={t('admin.competitionsAdmin.emptyCompetitions')}
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'slug', header: t('admin.competitionsAdmin.colSlug'), render: (r) => r.slug },
            {
              key: 'league',
              header: t('admin.competitionsAdmin.colLeague'),
              render: (r) =>
                r.isLeague ? <Badge variant="success">{t('admin.competitionsAdmin.league')}</Badge> : <Badge variant="muted">{t('admin.competitionsAdmin.other')}</Badge>,
            },
            ...(canManage
              ? [{
                  key: 'actions',
                  header: 'Akcije',
                  render: (r: Competition) => (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openForm('competition', r, null)} aria-label={t('actions.edit')}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void onDeleteComp(r)} aria-label={t('actions.delete')}>
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
