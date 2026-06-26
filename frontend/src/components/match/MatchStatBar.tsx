interface Props {
  label: string;
  home: number;
  away: number;
  suffix?: string;
}

export function MatchStatBar({ label, home, away, suffix = '' }: Props) {
  const total = home + away;
  const homePct = total > 0 ? Math.round((home / total) * 100) : 50;
  const awayPct = 100 - homePct;

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 text-sm">
        <span className="text-right font-semibold tabular-nums">
          {home}
          {suffix}
        </span>
        <span className="text-center text-text-muted">{label}</span>
        <span className="font-semibold tabular-nums">
          {away}
          {suffix}
        </span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="bg-primary transition-all" style={{ width: `${homePct}%` }} />
        <div className="bg-slate-300 transition-all" style={{ width: `${awayPct}%` }} />
      </div>
    </div>
  );
}
