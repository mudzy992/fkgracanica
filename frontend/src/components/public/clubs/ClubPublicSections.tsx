import { Link } from 'react-router-dom';
import { formatDateTime } from '../../../lib/utils';
import type { ClubPublicLastMatch } from '../../../hooks/use-club-public';
import type { ClubSquadSlot } from '../../../types/club-hub';
import { FormationPitch } from './FormationPitch';
import { PlayerCard } from '../players/PlayerCard';
import type { Player } from '../../../types';

export function lineupToPitchSlots(lineup: ClubPublicLastMatch['lineup']): ClubSquadSlot[] {
  return lineup
    .filter((l) => l.isStarter && l.positionX != null && l.positionY != null)
    .map((l, i) => ({
      id: l.id,
      clubId: l.player?.clubId ?? '',
      slotIndex: i,
      lineRole: (l.player?.position ?? 'MID') as ClubSquadSlot['lineRole'],
      positionX: l.positionX!,
      positionY: l.positionY!,
      isBench: false,
      playerId: l.playerId,
      player: l.player ?? null,
    }));
}

export function LastMatchLineupSection({ lastMatch }: { lastMatch: ClubPublicLastMatch }) {
  const pitchSlots = lineupToPitchSlots(lastMatch.lineup);
  const subs = lastMatch.lineup.filter((l) => !l.isStarter && l.player);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-text">Posljednja postava</h2>
        <Link to={`/utakmice/${lastMatch.matchId}`} className="text-sm text-primary hover:underline">
          {formatDateTime(lastMatch.scheduledAt)} · vs{' '}
          <span className="font-medium">{lastMatch.opponent.name}</span>
          {' '}({lastMatch.isHome ? 'D' : 'G'}) {lastMatch.homeScore}:{lastMatch.awayScore}
        </Link>
      </div>
      {pitchSlots.length > 0 ? (
        <FormationPitch slots={pitchSlots} horizontal />
      ) : (
        <p className="text-sm text-text-muted">Vizualna postava nije dostupna za ovu utakmicu.</p>
      )}
      {subs.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {subs.map((l) => (
            <PlayerCard key={l.id} player={l.player as Player} compact />
          ))}
        </div>
      )}
    </section>
  );
}

export function ClubPlayersGrid({ players }: { players: Player[] }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-text">Kadar</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
      </div>
    </section>
  );
}
