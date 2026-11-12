import { useEffect, useRef, useState } from 'react';
import { useMatch, usePlayers } from '../../../hooks';
import { useClubSquad } from '../../../hooks/use-club-hub';
import { useSetMatchLineup } from '../../../hooks/use-competition-admin';
import type { FormationSlot } from '../../../lib/formation-slots';
import type { MatchLineup } from '../../../types';
import { buildSquadFormationLayout } from '../../../lib/match-lineup-from-squad';
import { AdminFormSheet } from '../../../components/admin/AdminFormSheet';
import { FormationPitch } from '../../../components/admin/FormationPitch';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { getApiErrorMessage } from '../../../lib/api-error';
import {
  buildClubMatchLineup,
  excludeAssignedPlayers,
  hasSquadDefaults,
  playersIncludingSaved,
  retainUneditedLineupRows,
  slotsToLineupPayload,
} from './match-lineup-slots';

interface Props {
  matchId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchLineupSheet({ matchId, open, onOpenChange }: Props) {
  const { data: match, isLoading: ml } = useMatch(matchId ?? '');
  const save = useSetMatchLineup();
  const [side, setSide] = useState<'home' | 'away'>('home');
  const [saveError, setSaveError] = useState('');
  const [homeSlots, setHomeSlots] = useState<FormationSlot[]>([]);
  const [awaySlots, setAwaySlots] = useState<FormationSlot[]>([]);
  const edited = useRef(false);
  const baseline = useRef<{ lineup?: MatchLineup[]; home: FormationSlot[]; away: FormationSlot[] } | null>(null);

  const homeClubId = match?.homeClubId ?? match?.homeClub?.id ?? '';
  const awayClubId = match?.awayClubId ?? match?.awayClub?.id ?? '';

  const { data: homePlayers = [], isLoading: hpl } = usePlayers({ clubId: homeClubId, activeOnly: true });
  const { data: awayPlayers = [], isLoading: apl } = usePlayers({ clubId: awayClubId, activeOnly: true });
  const { data: homeSquad, isLoading: hsl } = useClubSquad(homeClubId);
  const { data: awaySquad, isLoading: asl } = useClubSquad(awayClubId);

  useEffect(() => {
    if (!open) {
      edited.current = false;
      baseline.current = null;
      setSaveError('');
      return;
    }
    if (!match || edited.current) return;
    const lineup = match.lineup ?? match.lineups;
    const home = buildClubMatchLineup(lineup, homeClubId, homeSquad?.slots, match.lineupConfigured);
    const away = excludeAssignedPlayers(
      buildClubMatchLineup(lineup, awayClubId, awaySquad?.slots, match.lineupConfigured), home,
    );
    baseline.current = { lineup, home, away };
    setHomeSlots(home);
    setAwaySlots(away);
  }, [open, match, homeClubId, awayClubId, homeSquad?.slots, awaySquad?.slots]);

  const loadFromSquad = (team: 'home' | 'away') => {
    const squad = team === 'home' ? homeSquad?.slots : awaySquad?.slots;
    const clubId = team === 'home' ? homeClubId : awayClubId;
    if (!squad) return;
    edited.current = true;
    const other = team === 'home' ? awaySlots : homeSlots;
    const next = excludeAssignedPlayers(buildClubMatchLineup(undefined, clubId, squad), other);
    if (team === 'home') setHomeSlots(next);
    else setAwaySlots(next);
  };

  const onSave = async () => {
    if (!matchId || !homeClubId || !awayClubId || hasLineupConflict) return;
    const selected = [
      ...slotsToLineupPayload(homeSlots, homeClubId, originalHomeSlots, lineup),
      ...slotsToLineupPayload(awaySlots, awayClubId, originalAwaySlots, lineup),
    ];
    const retained = retainUneditedLineupRows(lineup, originalSlots, selected, [homeClubId, awayClubId]);
    setSaveError('');
    try {
      await save.mutateAsync({ matchId, slots: [...selected, ...retained] });
      onOpenChange(false);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Postavu nije moguće sačuvati. Pokušajte ponovo.'));
    }
  };

  const lineup = baseline.current ? baseline.current.lineup : match?.lineup ?? match?.lineups;
  const hasLineupConflict = !!homeClubId && !!awayClubId && [lineup, match?.lineup ?? match?.lineups].some((rows) =>
    rows?.some((row) => !row.id.startsWith('squad-default-') && row.clubId !== homeClubId && row.clubId !== awayClubId),
  );
  const originalHomeSlots = baseline.current?.home ?? [];
  const originalAwaySlots = baseline.current?.away ?? [];
  const originalSlots = [...originalHomeSlots, ...originalAwaySlots];
  const retained = retainUneditedLineupRows(lineup, originalSlots, [], [homeClubId, awayClubId]);
  const hasHiddenStarters = retained.some((row) => row.isStarter);
  const slots = side === 'home' ? homeSlots : awaySlots;
  const otherSlots = side === 'home' ? awaySlots : homeSlots;
  const otherIds = new Set(otherSlots.map((slot) => slot.playerId).filter(Boolean));
  const players = (side === 'home'
    ? playersIncludingSaved(homePlayers, lineup, homeClubId)
    : playersIncludingSaved(awayPlayers, lineup, awayClubId))
    .filter((player) => !otherIds.has(player.id) || slots.some((slot) => slot.playerId === player.id));
  const setSlots = side === 'home' ? setHomeSlots : setAwaySlots;
  const loading = ml || hpl || apl || hsl || asl;
  const fromSquadHint = hasSquadDefaults(match?.lineup ?? match?.lineups);
  const activeSquad = side === 'home' ? homeSquad : awaySquad;
  const incompleteLayout = !!activeSquad?.slots?.length && !buildSquadFormationLayout(activeSquad.slots);

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Postava: ${match?.homeClub?.name ?? '?'} vs ${match?.awayClub?.name ?? '?'}`}
    >
      <input type="hidden" value={JSON.stringify([homeSlots, awaySlots])} readOnly />
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="space-y-4">
          {hasLineupConflict && (
            <p role="alert" className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-text">
              Spremljena postava sadrži igrače prethodnog kluba. Spremanje je blokirano radi očuvanja podataka.{' '}
              {match?.status === 'FINISHED'
                ? 'Utakmica je završena i zaključana; potreban je ručni pregled podataka i zasebna odluka o ispravci.'
                : 'Vratite odgovarajuće klubove utakmice prije uređivanja postave.'}
            </p>
          )}
          {saveError && (
            <p role="alert" className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-text">
              {saveError}
            </p>
          )}
          {fromSquadHint && (
            <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text">
              Igrači su učitani iz klupske postave kao predložak. Možete ga prilagoditi i sačuvati za ovu utakmicu.
            </p>
          )}
          {incompleteLayout && (
            <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text">
              Klupski raspored nema 11 valjanih pozicija. Koristi se rezervna 4-3-3 mreža; provjerite položaje.
            </p>
          )}
          {hasHiddenStarters && (
            <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text">
              Dodatni spremljeni starteri nisu prikazani u mreži od 11 mjesta; ostat će sačuvani.
            </p>
          )}
          <div className="flex gap-2">
            {(['home', 'away'] as const).map((s) => (
              <Button
                key={s}
                type="button"
                variant={side === s ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setSide(s)}
              >
                {s === 'home' ? match?.homeClub?.name ?? 'Domaći' : match?.awayClub?.name ?? 'Gosti'}
              </Button>
            ))}
          </div>
          <div data-dirty-ignore>
            <FormationPitch
              slots={slots}
              players={players}
              onSlotChange={(index, playerId) => {
                edited.current = true;
                setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, playerId } : slot)));
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" data-dirty-change onClick={() => loadFromSquad(side)}>
              Učitaj klupsku postavu ({side === 'home' ? 'domaći' : 'gosti'})
            </Button>
            <Button className="flex-1 sm:flex-none" onClick={() => void onSave()} disabled={save.isPending || hasLineupConflict}>
              Sačuvaj obje postave
            </Button>
          </div>
        </div>
      )}
    </AdminFormSheet>
  );
}
