import { ChevronDown, ChevronUp, Minus } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Props {
  change?: number;
  className?: string;
}

export function LeaguePositionBadge({ change, className }: Props) {
  if (change == null || change === 0) {
    return (
      <span className={cn('inline-flex items-center text-white/25', className)} title="Bez promjene">
        <Minus className="h-3 w-3" />
      </span>
    );
  }

  const up = change > 0;
  const abs = Math.abs(change);
  const label = up
    ? `Popeo se za ${abs} ${abs === 1 ? 'poziciju' : 'pozicije'}`
    : `Pao je za ${abs} ${abs === 1 ? 'poziciju' : 'pozicije'}`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 text-xs font-bold tabular-nums',
        up ? 'text-success' : 'text-danger',
        className,
      )}
      title={label}
    >
      {up ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      {abs}
    </span>
  );
}
