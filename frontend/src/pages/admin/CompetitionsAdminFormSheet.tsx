import { useEffect, useMemo, useState } from 'react';
import {
  useCreateCompetition,
  useCreateSeason,
  useUpdateCompetition,
  useUpdateSeason,
} from '../../hooks/use-competition-admin';
import { useCompetitions, useClubs } from '../../hooks';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { SeasonClubPicker } from '../../components/admin/SeasonClubPicker';
import { EntitySelect } from '../../components/admin/EntitySelect';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';

interface Competition {
  id: string;
  name: string;
  slug: string;
}

interface SeasonParticipant {
  clubId: string;
  club: { id: string; name: string; slug: string };
}

interface Season {
  id: string;
  name: string;
  yearStart: number;
  yearEnd: number;
  competitionId: string;
  isActive?: boolean;
  participants?: SeasonParticipant[];
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
  const { data: competitions } = useCompetitions();
  const { data: clubs } = useClubs();
  const createComp = useCreateCompetition();
  const updateComp = useUpdateCompetition();
  const createSeason = useCreateSeason();
  const updateSeason = useUpdateSeason();
  const [name, setName] = useState('');
  const [yearStart, setYearStart] = useState(new Date().getFullYear());
  const [yearEnd, setYearEnd] = useState(new Date().getFullYear());
  const [competitionId, setCompetitionId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [clubIds, setClubIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const compOptions = useMemo(
    () => ((competitions as Competition[] | undefined) ?? []).map((c) => ({ id: c.id, label: c.name })),
    [competitions],
  );
  const clubOptions = useMemo(
    () => ((clubs as { id: string; name: string; isOwnClub?: boolean }[] | undefined) ?? []),
    [clubs],
  );

  const editingSeasonId = editSeason?.id ?? null;
  const editingCompetitionId = editCompetition?.id ?? null;

  useEffect(() => {
    if (!open) return;
    setError('');
    if (mode === 'competition') {
      setName(editCompetition?.name ?? '');
    } else if (mode === 'season') {
      setName(editSeason?.name ?? '');
      setYearStart(editSeason?.yearStart ?? new Date().getFullYear());
      setYearEnd(editSeason?.yearEnd ?? new Date().getFullYear());
      setCompetitionId(editSeason?.competitionId ?? compOptions[0]?.id ?? '');
      setIsActive(editSeason?.isActive ?? true);
      if (editSeason) {
        setClubIds(editSeason.participants?.map((p) => p.clubId) ?? []);
      } else {
        setClubIds(clubOptions.map((c) => c.id));
      }
    }
    // Init samo pri otvaranju / promjeni entiteta — ne na svaki render ili refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, editingCompetitionId, editingSeasonId]);

  useEffect(() => {
    if (!open || mode !== 'season' || editSeason || !clubOptions.length) return;
    setClubIds((prev) => (prev.length ? prev : clubOptions.map((c) => c.id)));
  }, [open, mode, editSeason, clubOptions]);

  const save = async () => {
    try {
      setError('');
      if (mode === 'competition') {
        if (editCompetition) await updateComp.mutateAsync({ id: editCompetition.id, name });
        else await createComp.mutateAsync({ name });
      } else if (mode === 'season') {
        if (!clubIds.length) {
          setError('Odaberite barem jednog učesnika sezone.');
          return;
        }
        const body = { name, yearStart, yearEnd, competitionId, isActive, clubIds };
        if (editSeason) await updateSeason.mutateAsync({ id: editSeason.id, ...body });
        else await createSeason.mutateAsync(body);
      }
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Spremanje nije uspjelo.';
      setError(msg);
    }
  };

  const title =
    mode === 'competition'
      ? editCompetition
        ? 'Uredi takmičenje'
        : 'Novo takmičenje'
      : editSeason
        ? 'Uredi sezonu'
        : 'Nova sezona';

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv *" />
        {mode === 'season' && (
          <>
            <EntitySelect
              label="Takmičenje"
              value={competitionId}
              onChange={setCompetitionId}
              options={compOptions}
            />
            <Input type="number" value={yearStart} onChange={(e) => setYearStart(Number(e.target.value))} placeholder="Godina početka" />
            <Input type="number" value={yearEnd} onChange={(e) => setYearEnd(Number(e.target.value))} placeholder="Godina kraja" />
            <SeasonClubPicker clubs={clubOptions} value={clubIds} onChange={setClubIds} />
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Aktivna sezona</span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button onClick={() => void save()} disabled={!name || createComp.isPending || createSeason.isPending}>
          {editCompetition || editSeason ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}

export type { Competition, Season, Mode as CompetitionFormMode };
