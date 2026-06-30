import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { mediaUrl } from '../../lib/media';
import { playerPath } from '../../lib/public-routes';
import { POSITION_LABELS } from '../../lib/player-utils';
import type { Player } from '../../types';
import type { PlayerSeasonStats } from '../../types/club-hub';
import { cn } from '../../lib/utils';

interface Props {
  player: Player;
  stats?: PlayerSeasonStats | null;
  delay?: number;
  spotlight?: boolean;
  className?: string;
}

export function PlayerPortraitCard({ player, stats, delay = 0, spotlight, className }: Props) {
  const reduce = useReducedMotion();
  const pos = player.position
    ? POSITION_LABELS[player.position as keyof typeof POSITION_LABELS] ?? player.position
    : null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className={className}
    >
      <Link to={playerPath(player.id)} className="group block h-full">
        <div
          className={cn(
            'card-lift border-gradient-club relative h-full overflow-hidden rounded-2xl bg-surface',
            spotlight ? 'aspect-[3/4] min-h-[280px]' : 'aspect-[3/4]',
          )}
        >
          {player.number != null && (
            <span className="pointer-events-none absolute -right-1 top-2 font-display text-[5.5rem] font-bold leading-none text-white/[0.05] sm:text-[6.5rem]">
              {player.number}
            </span>
          )}

          {player.photoPath ? (
            <img
              src={mediaUrl(player.photoPath, 'medium')}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-primary/25 to-background font-display text-5xl font-bold text-primary-light">
              {player.number ?? '?'}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent opacity-95" />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:shadow-[inset_0_0_60px_rgba(0,102,255,0.12)]" />

          {pos && (
            <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/85 backdrop-blur-sm">
              {pos}
            </span>
          )}

          {(stats?.goals ?? 0) > 0 && (
            <span className="absolute right-3 top-3 rounded-full border border-primary/30 bg-primary/20 px-2 py-1 text-[10px] font-bold text-primary-light backdrop-blur-sm">
              {stats!.goals} gol{stats!.goals === 1 ? '' : 'a'}
            </span>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            {player.number != null && (
              <span className="font-display text-3xl font-bold text-primary-light/90">
                {player.number}
              </span>
            )}
            <p className="font-display text-sm font-bold uppercase leading-tight text-white sm:text-base">
              {player.firstName}
              <br />
              {player.lastName}
            </p>
            {stats && (
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide text-white/45">
                <span>{stats.appearances} utakmica</span>
                {(stats.assists ?? 0) > 0 && <span>{stats.assists} asist.</span>}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
