interface Props {
  label: string;
  home: number;
  away: number;
  suffix?: string;
  dark?: boolean;
}

export function MatchStatBar({ label, home, away, suffix = '', dark }: Props) {
  const total = home + away;
  const homePct = total > 0 ? Math.round((home / total) * 100) : 50;
  const awayPct = 100 - homePct;

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 text-sm">
        <span className={`text-right font-semibold tabular-nums ${dark ? 'text-white' : ''}`}>
          {home}
          {suffix}
        </span>
        <span className={`text-center ${dark ? 'text-white/50' : 'text-text-muted'}`}>{label}</span>
        <span className={`font-semibold tabular-nums ${dark ? 'text-white' : ''}`}>
          {away}
          {suffix}
        </span>
      </div>
      <div className={`flex h-2 overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
        <div className={`transition-all ${dark ? 'bg-amber-400' : 'bg-primary'}`} style={{ width: `${homePct}%` }} />
        <div className={`transition-all ${dark ? 'bg-white/25' : 'bg-slate-300'}`} style={{ width: `${awayPct}%` }} />
      </div>
    </div>
  );
}
