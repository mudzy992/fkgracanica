export function PercentRing({ percent, size = 120 }: { percent: number; size?: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  const labelClass = size >= 100 ? 'text-2xl' : 'text-sm';

  return (
    <div className="relative shrink-0 text-primary-light" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 140 140" className="-rotate-90" aria-hidden>
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <p
        className={`font-display absolute inset-0 grid place-items-center font-bold tabular-nums text-text ${labelClass}`}
      >
        {percent}%
      </p>
    </div>
  );
}
