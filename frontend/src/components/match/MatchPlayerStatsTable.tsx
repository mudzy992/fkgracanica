import { PlayerLink } from '../public/players/PlayerLink';
import { PremiumCard } from '../public/shell/PremiumCard';
import type { PlayerMatchStat } from '../../types/match-stats';

export function MatchPlayerStatsTable({
  title,
  players,
}: {
  title: string;
  players: PlayerMatchStat[];
}) {
  if (!players.length) return null;

  const hasDetail = players.some(
    (p) => p.goals || p.assists || p.yellowCards || p.redCards || p.shots || p.shotsOn,
  );

  return (
    <PremiumCard className="overflow-hidden p-0" hover={false}>
      <p className="border-b border-slate-100 px-4 py-3 font-medium">{title}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-surface text-left text-text-muted">
              <th className="p-3">Igrač</th>
              {hasDetail && (
                <>
                  <th className="p-3 text-center">G</th>
                  <th className="p-3 text-center">A</th>
                  <th className="p-3 text-center">U</th>
                  <th className="p-3 text-center">U+</th>
                  <th className="p-3 text-center">Ž/C</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.playerId} className="border-b border-slate-50 last:border-0">
                <td className="p-3">
                  <PlayerLink id={p.playerId} name={`${p.firstName} ${p.lastName}`} />
                  {!p.isStarter && (
                    <span className="ml-2 text-xs text-text-muted">(rez)</span>
                  )}
                </td>
                {hasDetail && (
                  <>
                    <td className="p-3 text-center tabular-nums">{p.goals || '—'}</td>
                    <td className="p-3 text-center tabular-nums">{p.assists || '—'}</td>
                    <td className="p-3 text-center tabular-nums">{p.shots || '—'}</td>
                    <td className="p-3 text-center tabular-nums">{p.shotsOn || '—'}</td>
                    <td className="p-3 text-center tabular-nums">
                      {p.yellowCards || p.redCards
                        ? `${p.yellowCards}/${p.redCards}`
                        : '—'}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PremiumCard>
  );
}
