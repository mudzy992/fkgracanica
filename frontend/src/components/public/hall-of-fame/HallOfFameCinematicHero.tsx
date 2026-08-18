import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, Crown, Star, Users } from 'lucide-react';

interface Props {
  totalCount: number;
  yearCount: number;
}

function KpiChip({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-amber-300/15 bg-white/5 px-4 py-3 text-center backdrop-blur-sm">
      <Icon size={16} className="mx-auto mb-2 text-amber-200" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="font-display mt-1 text-lg font-bold text-white sm:text-xl">{value}</p>
    </div>
  );
}

export function HallOfFameCinematicHero({ totalCount, yearCount }: Props) {
  const reduce = useReducedMotion();

  return (
    <header className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#05070d_0%,#0c1421_55%,#130d06_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_left,rgba(59,130,246,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-24 w-24 -translate-x-1/2 rounded-full border border-amber-300/15" />
      <div className="pointer-events-none absolute left-1/2 top-14 h-16 w-16 -translate-x-1/2 rounded-full border border-amber-300/10" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-100 sm:text-sm">
            <Crown className="h-4 w-4" />
            Kuća slavnih
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200/80 sm:text-sm">
            Nasljeđe kluba
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Lica koja su zauvijek ucrtana u historiju
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
            Poseban prostor za igrače, trenere i ljude čije se ime ne odvaja od najvećih trenutaka kluba.
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-sm uppercase tracking-[0.24em] text-amber-100/65">
            Tišina muzeja. Težina trofejnih godina. Glasovi koje tribina pamti.
          </p>

          {totalCount > 0 && (
            <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-3 md:grid-cols-3">
              <KpiChip icon={Users} label="Legendi" value={totalCount} />
              <KpiChip icon={Calendar} label="Godina" value={yearCount || '—'} />
              <KpiChip icon={Star} label="Status" value="Vječno" />
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
}
