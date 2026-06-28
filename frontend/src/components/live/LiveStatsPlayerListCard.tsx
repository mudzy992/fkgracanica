import type { LiveStatPlayerList } from '../../lib/live-stats-feed';

interface Props {
  stat: LiveStatPlayerList;
}

function PlayerList({ players, align }: { players: LiveStatPlayerList['awayPlayers']; align: 'left' | 'right' }) {
  if (!players.length) {
    return <p className={`text-xs text-white/40 ${align === 'right' ? 'text-right' : ''}`}>—</p>;
  }
  return (
    <ul className={`space-y-1 ${align === 'right' ? 'text-right' : ''}`}>
      {players.map((p, i) => (
        <li key={`${p.name}-${p.minute}-${i}`} className="text-xs text-white landscape:text-[11px]">
          {p.name}{' '}
          <span className="font-mono text-amber-300">
            ({p.isOwnGoal ? 'Autogol ' : ''}
            {p.minute}&apos;)
          </span>
        </li>
      ))}
    </ul>
  );
}

export function LiveStatsPlayerListCard({ stat }: Props) {
  return (
    <div className="pointer-events-none animate-in fade-in slide-in-from-bottom-3 rounded-xl border border-white/15 bg-black/85 px-5 py-4 shadow-2xl backdrop-blur-md duration-500 landscape:max-w-[28rem] landscape:px-4 landscape:py-3">
      <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-amber-300 landscape:text-[9px]">
        {stat.label}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 truncate text-sm font-semibold text-white landscape:text-xs">{stat.awayClub}</p>
          <PlayerList players={stat.awayPlayers} align="left" />
        </div>
        <div>
          <p className="mb-2 truncate text-right text-sm font-semibold text-white landscape:text-xs">
            {stat.homeClub}
          </p>
          <PlayerList players={stat.homePlayers} align="right" />
        </div>
      </div>
    </div>
  );
}
