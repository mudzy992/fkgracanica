import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMatches } from '../../../hooks';
import { formatDateTime } from '../../../lib/utils';
import { matchRoundLabel } from '../../../lib/round-utils';

export function HeroNextMatchBanner() {
  const reduce = useReducedMotion();
  const { data } = useMatches();
  const next = data
    ?.filter((m) => m.status === 'SCHEDULED' && new Date(m.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  if (!next) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-gradient-to-r from-background via-surface to-background"
    >
      <Link to={`/utakmice/${next.id}`} className="mx-auto block max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Sljedeća utakmica
            </span>
          </div>
          <div className="flex items-center gap-4 text-center">
            <span className="font-display text-lg font-bold text-white md:text-xl">
              {next.homeClub?.name ?? 'Domaćin'}
            </span>
            <span className="font-bold text-primary-light">VS</span>
            <span className="font-display text-lg font-bold text-white/70 md:text-xl">
              {next.awayClub?.name ?? 'Gost'}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <Calendar size={14} className="text-primary-light" />
              {formatDateTime(next.scheduledAt)}
            </span>
            {next.venue && (
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-primary-light" />
                {next.venue}
              </span>
            )}
            {matchRoundLabel(next) && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{matchRoundLabel(next)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
