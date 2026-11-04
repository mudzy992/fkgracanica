import { useEffect, useState } from 'react';
import { useMatch, usePlayers } from '../../../hooks';
import { useClubSquad } from '../../../hooks/use-club-hub';
import { useSetMatchLineup } from '../../../hooks/use-competition-admin';
import type { FormationSlot } from '../../../lib/formation-slots';
import { AdminFormSheet } from '../../../components/admin/AdminFormSheet';
import { FormationPitch } from '../../../components/admin/FormationPitch';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { cn } from '../../../lib/utils';
import {
  buildClubMatchLineup,
  hasSquadDefaults,
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
  const [homeSlots, setHomeSlots] = useState<FormationSlot[]>([]);
  const [awaySlots, setAwaySlots] = useState<FormationSlot[]>([]);

  const homeClubId = match?.homeClubId ?? match?.homeClub?.id ?? '';
  const awayClubId = match?.awayClubId ?? match?.awayClub?.id ?? '';

  const { data: homePlayers = [], isLoading: hpl } = usePlayers({ clubId: homeClubId, activeOnly: true });
  const { data: awayPlayers = [], isLoading: apl } = usePlayers({ clubId: awayClubId, activeOnly: true });
  const { data: homeSquad, isLoading: hsl } = useClubSquad(homeClubId);
  const { data: awaySquad, isLoading: asl } = useClubSquad(awayClubId);

  useEffect(() => {
    if (!match) return;
    const lineup = match.lineup ?? match.lineups;
    setHomeSlots(buildClubMatchLineup(lineup, homeClubId, homeSquad?.slots));
    setAwaySlots(buildClubMatchLineup(lineup, awayClubId, awaySquad?.slots));
  }, [match, homeClubId, awayClubId, homeSquad?.slots, awaySquad?.slots]);

  const loadFromSquad = (team: 'home' | 'away') => {
    const squad = team === 'home' ? homeSquad?.slots : awaySquad?.slots;
    const clubId = team === 'home' ? homeClubId : awayClubId;
    if (!squad) return;
    const next = buildClubMatchLineup(undefined, clubId, squad);
    if (team === 'home') setHomeSlots(next);
    else setAwaySlots(next);
  };

  const onSave = async () => {
    if (!matchId || !homeClubId || !awayClubId) return;
    await save.mutateAsync({
      matchId,
      slots: [
        ...slotsToLineupPayload(homeSlots, homeClubId),
        ...slotsToLineupPayload(awaySlots, awayClubId),
      ],
    });
    onOpenChange(false);
  };

  const slots = side === 'home' ? homeSlots : awaySlots;
  const players = side === 'home' ? homePlayers : awayPlayers;
  const setSlots = side === 'home' ? setHomeSlots : setAwaySlots;
  const loading = ml || hpl || apl || hsl || asl;
  const fromSquadHint = hasSquadDefaults(match?.lineup ?? match?.lineups);

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
          {fromSquadHint && (
            <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-muted">
              Igrači su učitani iz klupske postave po pozicijama. Sačuvajte da postava bude vidljiva na pre-match
              prikazu.
            </p>
          )}
          <div className="flex gap-2">
            {(['home', 'away'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2 text-sm font-medium',
                  side === s ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200',
                )}
              >
                {s === 'home' ? match?.homeClub?.name ?? 'Domaći' : match?.awayClub?.name ?? 'Gosti'}
              </button>
            ))}
          </div>
          <div data-dirty-ignore>
            <FormationPitch
              slots={slots}
              players={players}
              onSlotChange={(index, playerId) =>
                setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, playerId } : slot)))
              }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" data-dirty-change onClick={() => loadFromSquad(side)}>
              Učitaj klupsku postavu ({side === 'home' ? 'domaći' : 'gosti'})
            </Button>
            <Button className="flex-1 sm:flex-none" onClick={() => void onSave()} disabled={save.isPending}>
              Sačuvaj obje postave
            </Button>
          </div>
        </div>
      )}
    </AdminFormSheet>
  );
}
