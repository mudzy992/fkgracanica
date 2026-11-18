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
import { Skeleton } from '../../components/ui/skeleton';
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
  const {
    data: competitions,
    isLoading: cl,
    isError: ce = false,
    isFetching: cf = false,
    dataUpdatedAt: cu = 0,
    refetch: rc,
  } = useCompetitions() as unknown as {
    data: Competition[] | undefined;
    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
    dataUpdatedAt: number;
    refetch: () => void;
  };
  const {
    data: seasons,
    isLoading: sl,
    isError: se = false,
    isFetching: sf = false,
    dataUpdatedAt: su = 0,
    refetch: rs,
  } = useSeasons() as unknown as {
    data: Season[] | undefined;
    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
    dataUpdatedAt: number;
    refetch: () => void;
  };
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

  const lastUpdatedTs = Math.max(cu ?? 0, su ?? 0);
  const lastUpdated = lastUpdatedTs
    ? new Date(lastUpdatedTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
  const isFetchingAny = Boolean(cf || sf);
  const handleRefresh = () => {
    void (rc as unknown as (() => void) | undefined)?.();
    void (rs as unknown as (() => void) | undefined)?.();
  };

  return (
    <>
      <Seo title={t('admin.competitionsAdmin.metaTitle')} />
      {dialog}
      <AdminPageShell
        title={t('admin.competitionsAdmin.title')}
        actions={
          canManage ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openForm('competition', null, null)}
                disabled={deleteComp.isPending}
              >
                <Plus aria-hidden className="mr-1 h-4 w-4" />
                {t('admin.competitionsAdmin.catalogShort')}
              </Button>
              <Button size="sm" onClick={() => openForm('season', null, null)} disabled={deleteSeason.isPending}>
                <Plus aria-hidden className="mr-1 h-4 w-4" />
                {t('admin.competitionsAdmin.seasonShort')}
              </Button>
            </div>
          ) : undefined
        }
      >
        {lastUpdated ? (
          <div className="flex items-center justify-end gap-3 border-b border-[var(--border-subtle)] px-4 py-2 text-xs text-text-muted">
            <span>{t('admin.home.lastUpdated', { defaultValue: 'Ažurirano u {{time}}', time: lastUpdated })}</span>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetchingAny}>
              {isFetchingAny ? t('admin.common.loading') : t('admin.home.refresh', { defaultValue: 'Osvježi' })}
            </Button>
          </div>
        ) : null}
        <h2 className="border-b border-[var(--border-subtle)] px-4 py-3 text-sm font-semibold">{t('admin.competitionsAdmin.seasons')}</h2>
        {se ? (
          <div role="alert" className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-text-muted">{t('admin.common.loadError', { defaultValue: 'Greška pri učitavanju.' })}</p>
            <Button variant="outline" onClick={() => void (rs as unknown as (() => void) | undefined)?.()} disabled={Boolean(sf)}>
              {sf ? t('admin.common.loading') : t('actions.retry', { defaultValue: 'Pokušaj ponovo' })}
            </Button>
          </div>
        ) : sl ? (
          <div aria-busy="true" className="space-y-3 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : seasonList.length === 0 ? (
          <p role="status" className="p-6 text-center text-text-muted">{t('admin.competitionsAdmin.emptySeasons')}</p>
        ) : (
          <AdminDataTable
            rows={seasonList}
            empty={t('admin.competitionsAdmin.emptySeasons')}
            columns={[
              { key: 'name', header: t('admin.competitionsAdmin.colName'), render: (r) => (r as Season).name },
              { key: 'years', header: t('admin.competitionsAdmin.colPeriod'), render: (r) => `${(r as Season).yearStart}–${(r as Season).yearEnd}` },
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
                  <Link to={`/admin/seasons/${(r as Season).id}`} className={`text-sm ${adminLinkClass}`}>
                    {t('admin.competitionsAdmin.open')}
                  </Link>
                ),
              },
              {
                key: 'active',
                header: t('admin.competitionsAdmin.colActive'),
                render: (r) => ((r as Season).isActive ? <Badge variant="success">{t('admin.common.yes')}</Badge> : <Badge variant="muted">{t('admin.common.no')}</Badge>),
              },
              ...(canManage
                ? [{
                    key: 'actions',
                    header: t('admin.common.actions'),
                    render: (r: Season) => (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openForm('season', null, r)} aria-label={t('actions.edit')} disabled={deleteSeason.isPending}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => void onDeleteSeason(r)} aria-label={t('actions.delete')} disabled={deleteSeason.isPending}>
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    ),
                  }]
                : []),
            ]}
          />
        )}
        <h2 className="border-b border-t border-[var(--border-subtle)] px-4 py-3 text-sm font-semibold">{t('admin.competitionsAdmin.catalog')}</h2>
        {ce ? (
          <div role="alert" className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-text-muted">{t('admin.common.loadError', { defaultValue: 'Greška pri učitavanju.' })}</p>
            <Button variant="outline" onClick={() => void (rc as unknown as (() => void) | undefined)?.()} disabled={Boolean(cf)}>
              {cf ? t('admin.common.loading') : t('actions.retry', { defaultValue: 'Pokušaj ponovo' })}
            </Button>
          </div>
        ) : cl ? (
          <div aria-busy="true" className="space-y-3 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : compList.length === 0 ? (
          <p role="status" className="p-6 text-center text-text-muted">{t('admin.competitionsAdmin.emptyCompetitions')}</p>
        ) : (
          <AdminDataTable
            rows={compList}
            empty={t('admin.competitionsAdmin.emptyCompetitions')}
            columns={[
              { key: 'name', header: 'Naziv', render: (r) => (r as Competition).name },
              { key: 'slug', header: t('admin.competitionsAdmin.colSlug'), render: (r) => (r as Competition).slug },
              {
                key: 'league',
                header: t('admin.competitionsAdmin.colLeague'),
                render: (r) =>
                  (r as Competition).isLeague ? <Badge variant="success">{t('admin.competitionsAdmin.league')}</Badge> : <Badge variant="muted">{t('admin.competitionsAdmin.other')}</Badge>,
              },
              ...(canManage
                ? [{
                    key: 'actions',
                    header: 'Akcije',
                    render: (r: Competition) => (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openForm('competition', r, null)} aria-label={t('actions.edit')} disabled={deleteComp.isPending}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => void onDeleteComp(r)} aria-label={t('actions.delete')} disabled={deleteComp.isPending}>
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    ),
                  }]
                : []),
            ]}
          />
        )}
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
