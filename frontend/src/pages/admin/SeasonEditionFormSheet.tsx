import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddSeasonCompetition, useUpdateSeasonCompetition } from '../../hooks/use-season-admin';
import { useCompetitions, useClubs } from '../../hooks';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { SeasonClubPicker } from '../../components/admin/SeasonClubPicker';
import { EntitySelect } from '../../components/admin/EntitySelect';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';

type CatalogItem = { id: string; name: string; isLeague?: boolean };
type Participant = { clubId: string };
export type SeasonEditionRow = {
  id: string;
  competitionId: string;
  competition?: { name: string; isLeague?: boolean };
  participants?: Participant[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonId: string;
  editEdition: SeasonEditionRow | null;
}

export function SeasonEditionFormSheet({ open, onOpenChange, seasonId, editEdition }: Props) {
  const { t } = useTranslation();
  const { data: competitions } = useCompetitions();
  const { data: clubs } = useClubs();
  const addEdition = useAddSeasonCompetition();
  const updateEdition = useUpdateSeasonCompetition();
  const [competitionId, setCompetitionId] = useState('');
  const [newName, setNewName] = useState('');
  const [isLeague, setIsLeague] = useState(false);
  const [clubIds, setClubIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const catalog = useMemo(
    () =>
      ((competitions as CatalogItem[] | undefined) ?? []).map((c) => ({ id: c.id, label: c.name })),
    [competitions],
  );
  const clubOptions = useMemo(
    () => (clubs as { id: string; name: string; isOwnClub?: boolean }[] | undefined) ?? [],
    [clubs],
  );

  useEffect(() => {
    if (!open) return;
    setError('');
    setNewName('');
    setIsLeague(false);
    if (editEdition) {
      setCompetitionId(editEdition.competitionId);
      setClubIds(editEdition.participants?.map((p) => p.clubId) ?? []);
    } else {
      setCompetitionId(catalog[0]?.id ?? '');
      setClubIds(clubOptions.map((c) => c.id));
    }
  }, [open, editEdition?.id, catalog, clubOptions, editEdition]);

  const save = async () => {
    try {
      setError('');
      if (editEdition) {
        await updateEdition.mutateAsync({ seasonId, editionId: editEdition.id, clubIds });
      } else {
        const body = newName.trim()
          ? { seasonId, name: newName.trim(), isLeague, clubIds }
          : { seasonId, competitionId, clubIds };
        await addEdition.mutateAsync(body);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Spremanje nije uspjelo.');
    }
  };

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editEdition ? 'Učesnici takmičenja' : 'Dodaj takmičenje'}
    >
      <div className="space-y-4">
        {editEdition ? (
          <p className="text-sm text-text-muted">{editEdition.competition?.name}</p>
        ) : (
          <>
            <EntitySelect
              label={t('admin.seasonEdition.fromCatalog')}
              value={competitionId}
              onChange={setCompetitionId}
              options={catalog}
            />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('admin.seasonEdition.newCompetition')}
            />
            {newName.trim() ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{t('admin.seasonEdition.league')}</span>
                <Switch checked={isLeague} onCheckedChange={setIsLeague} />
              </div>
            ) : null}
          </>
        )}
        <SeasonClubPicker clubs={clubOptions} value={clubIds} onChange={setClubIds} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button
          onClick={() => void save()}
          disabled={addEdition.isPending || updateEdition.isPending}
        >
          {editEdition ? 'Spremi' : 'Dodaj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
