import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, Shield, Trophy } from 'lucide-react';
import { seasonLabel, type SeasonOption } from '../../../lib/season-utils';

interface Props {
  season?: SeasonOption | null;
  teamCount: number;
  roundsPlayed: number;
  leaderName?: string;
  leaderPoints?: number;
}

function KpiChip({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) {
  return (
    <div className="glass-premium rounded-xl px-4 py-3 text-center">
      <Icon size={16} className="mx-auto mb-2 text-primary-light" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="font-display mt-1 text-lg font-bold text-white sm:text-xl">{value}</p>
    </div>
  );
}

export function LeagueCinematicHero({ season, teamCount, roundsPlayed, leaderName, leaderPoints }: Props) {
  const reduce = useReducedMotion();

  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-page-hero)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-light sm:text-sm">
            Prvenstvo
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Liga
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/60 sm:text-lg">
            {season ? seasonLabel(season) : 'Tabela, rezultati i statistike sezone.'}
          </p>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiChip icon={Shield} label="Timova" value={teamCount || '—'} />
            <KpiChip icon={Calendar} label="Odigrano kola" value={roundsPlayed || '—'} />
            <KpiChip
              icon={Trophy}
              label="Lider"
              value={leaderName ? `${leaderName}` : '—'}
            />
            <KpiChip
              icon={Trophy}
              label="Bodovi lidera"
              value={leaderPoints ?? '—'}
            />
          </div>
        </motion.div>
      </div>
    </header>
  );
}
