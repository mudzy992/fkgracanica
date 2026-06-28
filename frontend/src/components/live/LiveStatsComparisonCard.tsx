import type { LiveStatComparison } from '../../lib/live-stats-feed';

interface Props {
  stat: LiveStatComparison;
}

export function LiveStatsComparisonCard({ stat }: Props) {
  return (
    <div className="pointer-events-none animate-in fade-in slide-in-from-bottom-3 rounded-xl border border-white/15 bg-black/85 px-5 py-4 shadow-2xl backdrop-blur-md duration-500 landscape:px-4 landscape:py-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <p className="truncate text-sm font-semibold text-white landscape:text-xs">{stat.awayClub}</p>
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-amber-300 landscape:text-[9px]">
          {stat.label}
        </p>
        <p className="truncate text-right text-sm font-semibold text-white landscape:text-xs">{stat.homeClub}</p>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className="font-display text-4xl font-bold tabular-nums text-white landscape:text-3xl">{stat.away}</p>
        <span className="text-white/30">–</span>
        <p className="text-right font-display text-4xl font-bold tabular-nums text-white landscape:text-3xl">
          {stat.home}
        </p>
      </div>
    </div>
  );
}
