import { motion, useReducedMotion } from 'framer-motion';
import { Archive, Calendar, FolderOpen } from 'lucide-react';

interface Props {
  totalCount: number;
  yearCount: number;
  categoryCount: number;
}

function KpiChip({ icon: Icon, label, value }: { icon: typeof Archive; label: string; value: string | number }) {
  return (
    <div className="glass-premium rounded-xl px-4 py-3 text-center">
      <Icon size={16} className="mx-auto mb-2 text-primary-light" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="font-display mt-1 text-lg font-bold text-white sm:text-xl">{value}</p>
    </div>
  );
}

export function MuseumCinematicHero({ totalCount, yearCount, categoryCount }: Props) {
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
            Baština
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Muzej
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/60 sm:text-lg">
            Artefakti, uspomene i historijski trenuci kluba.
          </p>

          {totalCount > 0 && (
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <KpiChip icon={Archive} label="Predmeta" value={totalCount} />
              <KpiChip icon={Calendar} label="Godina" value={yearCount || '—'} />
              <KpiChip icon={FolderOpen} label="Kategorije" value={categoryCount || '—'} />
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
}
