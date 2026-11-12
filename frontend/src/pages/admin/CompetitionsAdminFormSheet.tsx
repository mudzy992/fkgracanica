import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateCompetition, useUpdateCompetition } from '../../hooks/use-competition-admin';
import { useCreateSeason, useUpdateSeason } from '../../hooks/use-season-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';

interface Competition {
  id: string;
  name: string;
  slug: string;
  isLeague?: boolean;
}

interface Season {
  id: string;
  name: string;
  yearStart: number;
  yearEnd: number;
  isActive?: boolean;
}

type Mode = 'competition' | 'season' | null;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  editCompetition: Competition | null;
  editSeason: Season | null;
}

export function CompetitionsAdminFormSheet({
  open,
  onOpenChange,
  mode,
  editCompetition,
  editSeason,
}: Props) {
  const { t } = useTranslation();
  const createComp = useCreateCompetition();
  const updateComp = useUpdateCompetition();
  const createSeason = useCreateSeason();
  const updateSeason = useUpdateSeason();
  const [name, setName] = useState('');
  const [yearStart, setYearStart] = useState(new Date().getFullYear());
  const [yearEnd, setYearEnd] = useState(new Date().getFullYear() + 1);
  const [isActive, setIsActive] = useState(true);
  const [isLeague, setIsLeague] = useState(false);
  const [error, setError] = useState('');

  const editingSeasonId = editSeason?.id ?? null;
  const editingCompetitionId = editCompetition?.id ?? null;

  useEffect(() => {
    if (!open) return;
    setError('');
    if (mode === 'competition') {
      setName(editCompetition?.name ?? '');
      setIsLeague(editCompetition?.isLeague ?? false);
    } else if (mode === 'season') {
      setName(editSeason?.name ?? '');
      setYearStart(editSeason?.yearStart ?? new Date().getFullYear());
      setYearEnd(editSeason?.yearEnd ?? new Date().getFullYear() + 1);
      setIsActive(editSeason?.isActive ?? true);
    }
  }, [open, mode, editingCompetitionId, editingSeasonId, editCompetition, editSeason]);

  const save = async () => {
    try {
      setError('');
      if (mode === 'competition') {
        /* v8 ignore next */
        if (editCompetition)
          await updateComp.mutateAsync({ id: editCompetition.id, name, isLeague });
        else await createComp.mutateAsync({ name, isLeague });
      }
      /* v8 ignore next */
      else if (mode === 'season') {
        const body = { name, yearStart, yearEnd, isActive };
        if (editSeason) await updateSeason.mutateAsync({ id: editSeason.id, ...body });
        else await createSeason.mutateAsync(body);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Spremanje nije uspjelo.');
    }
  };

  const title =
    mode === 'competition'
      ? editCompetition
        ? t('admin.competitionForm.edit')
        : t('admin.competitionForm.create')
      : editSeason
        ? t('admin.competitionForm.editSeason')
        : t('admin.competitionForm.newSeason');

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('admin.competitionForm.nameRequired')}
        />
        {mode === 'competition' && (
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-sm font-medium">{t('admin.competitionForm.league')}</span>
              <p className="text-xs text-text-muted">{t('admin.competitionForm.leagueHint')}</p>
            </div>
            <Switch checked={isLeague} onCheckedChange={setIsLeague} />
          </div>
        )}
        {mode === 'season' && (
          <>
            <Input
              type="number"
              value={yearStart}
              onChange={(e) => setYearStart(Number(e.target.value))}
              placeholder={t('admin.competitionForm.yearStart')}
            />
            <Input
              type="number"
              value={yearEnd}
              onChange={(e) => setYearEnd(Number(e.target.value))}
              placeholder={t('admin.competitionForm.yearEnd')}
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{t('admin.competitionForm.activeSeason')}</span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button
          onClick={() => void save()}
          disabled={!name || createComp.isPending || createSeason.isPending}
        >
          {editCompetition || editSeason ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}

export type { Competition, Season, Mode as CompetitionFormMode };
