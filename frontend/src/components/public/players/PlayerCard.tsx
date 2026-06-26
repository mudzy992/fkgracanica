import { Link } from 'react-router-dom';
import { mediaUrl } from '../../../lib/media';
import { playerPath } from '../../../lib/public-routes';
import { POSITION_LABELS } from '../../../lib/player-utils';
import type { Player } from '../../../types';
import { cn } from '../../../lib/utils';

interface Props {
  player: Player;
  compact?: boolean;
  linkable?: boolean;
}

export function PlayerCard({ player, compact, linkable = true }: Props) {
  const inner = (
    <>
      {player.photoPath ? (
        <img
          src={mediaUrl(player.photoPath, 'thumb')}
          alt=""
          className={cn('rounded-full object-cover', compact ? 'h-10 w-10' : 'h-14 w-14')}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-primary/10 font-bold text-primary',
            compact ? 'h-10 w-10 text-sm' : 'h-14 w-14 text-lg',
          )}
        >
          {player.number ?? '?'}
        </div>
      )}
      <div className="min-w-0">
        <p className={cn('font-semibold text-text', compact && 'text-sm')}>
          {player.firstName} {player.lastName}
        </p>
        <p className="text-sm text-text-muted">
          {player.number != null ? `#${player.number}` : ''}
          {player.number != null && player.position ? ' · ' : ''}
          {player.position ? POSITION_LABELS[player.position as keyof typeof POSITION_LABELS] ?? player.position : ''}
        </p>
      </div>
    </>
  );

  const className = cn(
    'flex items-center gap-3 rounded-xl border border-slate-200/80 bg-background p-3 shadow-sm transition hover:border-primary/30 hover:shadow-md dark:border-slate-700',
    compact && 'p-2',
  );

  if (!linkable) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Link to={playerPath(player.id)} className={className}>
      {inner}
    </Link>
  );
}
